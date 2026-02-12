// export default () => ({});

export default {
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,

        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },

        tls: {
          rejectUnauthorized: false,
        },
      },

      settings: {
        defaultFrom: process.env.SMTP_USER,
        defaultReplyTo: process.env.SMTP_RESPONSE,
      },
    },
  },
};
