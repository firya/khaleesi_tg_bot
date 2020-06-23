import nodemailer from 'nodemailer';

class Mail {
  constructor() {
    this.transporter = null;
  }

  init = async () => {
    this.transporter = nodemailer.createTransport({
      host: "smtp.yandex.ru",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      }
    });
  }

  send = async (to, subject, message, attachments = []) => {
    if (!this.transporter) {
      await this.init();
    }

    const mailMessage = {
      from: `"Statibot ⏱️" <${process.env.MAIL_USER}>`,
      to: to,
      subject: subject,
      html: message,
      attachments: attachments
    }

    let info = await this.transporter.sendMail(mailMessage);

    console.log("Message sent: %s", info.messageId);
  }
}

export default new Mail();