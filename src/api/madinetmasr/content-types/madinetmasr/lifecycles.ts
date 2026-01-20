export default {
  async afterCreate(event: any) {
    // Only trigger for madinetmasr content type
    if (event.model?.uid !== 'api::madinetmasr.madinetmasr') return;

    const { result } = event;

    // Fetch the full entry with attachments populated
    const fullEntry = await strapi.db
      .query('api::madinetmasr.madinetmasr')
      .findOne({
        where: { id: result.id },
        populate: ['attachments'], // ensure files are loaded
      });

    // Prevent duplicate emails
    if (fullEntry.emailSent) return;

    const { title, desc, attachments } = fullEntry;

    // Build HTML for attachments (if any)
    const attachmentsHtml =
      attachments?.length
        ? attachments
            .map((file: any) => {
              const fileUrl = file.url.startsWith('http')
                ? file.url
                : `http://localhost:1337${file.url}`;
              return `<li><a href="${fileUrl}" target="_blank">${file.name}</a></li>`;
            })
            .join('')
        : '<li>No attachments</li>';

    const emailHtml = `
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Description:</strong> ${desc}</p>
      <p><strong>Attachments:</strong></p>
      <ul>${attachmentsHtml}</ul>
    `;

    try {
      await strapi.plugin('email').service('email').send({
        to: 'aymfoles@gmail.com',
        subject: `Madinet Masr Change Request: ${title}`,
        html: emailHtml,
      });

      strapi.log.info(`Email sent for madinetmasr: ${title}`);

      // Mark entry as emailed to prevent duplicates
      await strapi.db.query('api::madinetmasr.madinetmasr').update({
        where: { id: fullEntry.id },
        data: { emailSent: true },
      });
    } catch (err) {
      strapi.log.error(
        `Failed to send email for madinetmasr ${title}:`,
        err
      );
    }
  },
};
