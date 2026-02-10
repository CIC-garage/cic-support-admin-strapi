export default {
  async afterCreate(event: any) {
    // Only trigger for tmg content type
    if (event.model?.uid !== 'api::tmg.tmg') return;

    const { result } = event;

    // Fetch the full entry with attachments populated
    const fullEntry = await strapi.db
      .query('api::tmg.tmg')
      .findOne({
        where: { id: result.id },
        populate: ['attachments'], // ensure files are loaded
      });

    // Prevent duplicate emails
    if (fullEntry.emailSent) return;

    const { title, desc, attachments, priority, condition } = fullEntry;

    // Build HTML for attachments (if any)
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

    const emailHtml = `
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Description:</strong> ${desc}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p><strong>Type:</strong> ${condition}</p>
      <p><strong>Attachments:</strong></p>
      <ul>${attachmentsHtml}</ul>
    `;

    try {
      await strapi.plugin('email').service('email').send({
        to: 'helpdesk@cic.ae',
        subject: `TMG Change Request: ${title}`,
        html: emailHtml,
      });

      strapi.log.info(`Email sent for tmg: ${title}`);

      // Mark entry as emailed to prevent duplicates
      await strapi.db.query('api::tmg.tmg').update({
        where: { id: fullEntry.id },
        data: { emailSent: true },
      });
    } catch (err) {
      strapi.log.error(
        `Failed to send email for tmg ${title}:`,
        err
      );
    }
  },
};
