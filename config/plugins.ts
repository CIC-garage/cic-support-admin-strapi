export default {
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for port 465
        auth: {
          user: 'ayoussif360@gmail.com',     
          pass: 'crikvafishzwvlje',        
        },
      },
      settings: {
        defaultFrom: 'ayoussif360@gmail.com',
        defaultReplyTo: 'ayoussif360@gmail.com',
      },
    },
  },
};
