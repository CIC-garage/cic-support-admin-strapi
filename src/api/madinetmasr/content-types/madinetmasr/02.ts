export default {
  async afterCreate(event: any) {
    if (event.model?.uid !== 'api::madinetmasr.madinetmasr') return;

    const { result } = event;

    if (result.emailSent === true) return;

    const entry = await strapi.db
      .query('api::madinetmasr.madinetmasr')
      .findOne({
        where: { id: result.id },
        populate: ['attachments', 'response'],
      });

    if (!entry) return;

    const { title, desc, attachments, priority, condition, email, response } = entry;

    // Build attachments HTML
    const attachmentsHtml =
      attachments?.length
        ? attachments
            .map((file: any) => {
              const fileUrl = file.url.startsWith('http')
                ? file.url
                : `https://cic-support-dev.eshtri-cluster-eu-de-1-bx-8f23923b84c5cec3cecb2d74397b77c3-0000.eu-de.containers.appdomain.cloud${file.url}`;

              return `<li><a href="${fileUrl}" target="_blank">${file.name}</a></li>`;
            })
            .join('')
        : '<li>No attachments</li>';

    // Build responses HTML
    const responsesHtml =
      response?.length
        ? response
            .map((r: any) => `<li><b>${r.user}:</b> ${r.text}</li>`)
            .join('')
        : '<li>We\'ve received your request and will investigate further. You\'ll hear back from us soon, Thank you</li>';

    const html = `
      <h3>New Support Ticket</h3>
      <p><b>Title:</b> ${title}</p>
      <p><b>Description:</b> ${desc}</p>
      <p><b>Priority:</b> ${priority}</p>
      <p><b>Type:</b> ${condition}</p>

      <p><b>Attachments:</b></p>
      <ul>${attachmentsHtml}</ul>

      <p><b>Responses:</b></p>
      <ul>${responsesHtml}</ul>
    `;

    try {
      await strapi.plugin('email').service('email').send({
        to: ['helpdesk@cic.ae', email],
        subject: `Madinet Masr Ticket: ${title}`,
        html,
      });

      // Mark ticket as emailed
      await strapi.db.query('api::madinetmasr.madinetmasr').update({
        where: { id: entry.id },
        data: { emailSent: true },
      });

      strapi.log.info(`Ticket email sent: ${title}`);
    } catch (err) {
      strapi.log.error('Create mail failed', err);
    }
  },
};