// Memory lock using a "fingerprint" (Title + Email) to prevent duplicates
const emailLock = new Map<string, number>();

const sendTicketEmail = async (event: any) => {
  const { result } = event;
  
  // 1. Create a unique fingerprint for this specific ticket
  // We use title + email because IDs can sometimes be inconsistent during uploads
  const fingerprint = `${result.title}-${result.email}`.toLowerCase().replace(/\s/g, '');
  const now = Date.now();

  // 2. DUPLICATE PROTECTION
  const lastSent = emailLock.get(fingerprint);
  if (lastSent && now - lastSent < 10000) { // 10-second window
    return;
  }

  // Set the lock immediately
  emailLock.set(fingerprint, now);

  try {
    // 3. WAIT FOR RELATIONS (Increased to 2s to be safe with IDs/Attachments)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 4. FETCH FRESH DATA
    const entry = await strapi.db.query('api::madinetmasr.madinetmasr').findOne({
      where: { id: result.id },
      populate: ['attachments', 'response'],
    });

    if (!entry || !entry.title) {
      emailLock.delete(fingerprint);
      return;
    }

    const { id, title, desc, attachments, priority, condition, email, response } = entry;

    // attachments HTML
    const attachmentsHtml = attachments?.length
      ? attachments
          .map((file: any) => {
            const fileUrl = file.url.startsWith('http')
              ? file.url
              : `https://cic-support-dev.eshtri-cluster-eu-de-1-bx-8f23923b84c5cec3cecb2d74397b77c3-0000.eu-de.containers.appdomain.cloud${file.url}`;
            return `<li><a href="${fileUrl}" target="_blank">${file.name}</a></li>`;
          })
          .join('')
      : '<li>No attachments</li>';

    const responsesHtml = response?.length
      ? response.map((r: any) => `<li><b>${r.user || 'Support'}:</b> ${r.text}</li>`).join('')
      : '<li>No response updates yet.</li>';

    const html = `
      <p><b>Ticket ID:</b> ${id}</p>
      <p><b>Title:</b> ${title}</p>
      <p><b>Description:</b> ${desc}</p>
      <p><b>Priority:</b> ${priority}</p>
      <p><b>Type:</b> ${condition}</p>
      <p><b>Attachments:</b></p>
      <ul>${attachmentsHtml}</ul>
      <p><b>Latest Responses:</b></p>
      <ul>${responsesHtml}</ul>
    `;

    // 5. SEND EMAIL
    await strapi.plugin('email').service('email').send({
      to: ['helpdesk@cic.ae', email],
      subject: `Ticket: [#${id}]`,
      html,
    });

    strapi.log.info(`Email sent once for Fingerprint: ${fingerprint}`);

  } catch (err) {
    strapi.log.error('Failed to send ticket email:', err);
    emailLock.delete(fingerprint);
  }
};

export default {
  async afterCreate(event: any) {
    if (event.model?.uid !== 'api::madinetmasr.madinetmasr') return;
    await sendTicketEmail(event);
  },

  async afterUpdate(event: any) {
    if (event.model?.uid !== 'api::madinetmasr.madinetmasr') return;
    await sendTicketEmail(event);
  },
};