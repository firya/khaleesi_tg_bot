import Mail from '../../mail/mail.js';
import PDF from '../../report/pdf.js';
import DB from '../../db/db.js';
import { findDateAlias, dateIntervalToUserView, parseDate } from '../../utils.js';

class MailReport {
  constructor() {
    this.commands = [/\/mail[\s]?([a-z]+)?[\s]?([a-z0-9\.]+)?[\s]?([1])?$/];
    this.examples = ['/mail'];
    this.onlyAdmin = false;
  }

  help = () => {
    return `${this.examples.join(", ")} — отправлет выбранный отчет на почту`;
  }

  reply = async (msg, match) => {
    const chatId = msg.chat.id;
    if (match[1] && match[2]) {
      const date = findDateAlias(match[2]);
      const command = match[1];

      var user = await DB.query(`SELECT * FROM bot_accounts WHERE chat_id=${chatId}`);
      var mailto = user[0].email;

      if (mailto) {
        var subject = dateIntervalToUserView(parseDate(date), 'Отчет за', false);

        const force = (match[3]) ? true : false;

        await PDF.generateHTML(date, command, force)
        await PDF.generatePDF(date, command, force)
        await Mail.send(mailto, subject, subject, [
          {
            filename: `${command}_${date}.pdf`,
            path: `./static/reports/pdf/${command}_${date}.pdf`
          }
        ]);
        return { reply: `Отчет отправлен` };
      } else {
        return { reply: `Не указан email` };
      }
    } else {
      return { reply: `Укажите два параметра, например /mail createdat 01.01.2020` };
    }
  }
}

export default new MailReport();