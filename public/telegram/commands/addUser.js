import DB from '../../db/db.js';

class AddUser {
  constructor() {
    this.commands = [/\/adduser[\s]?([\d]+)?[\s]?([a-z0-9\.\@\-\_]+)?[\s]?([\d])?$/, /^\/Добавить пользователя[\s]?([\d]+)?[\s]?([a-z0-9\.\@\-\_]+)?[\s]?([\d])?$/, /^🙎‍♂️ Добавить пользователя[\s]?([\d]+)?[\s]?([a-z0-9\.\@\-\_]+)?[\s]?([\d])?$/];
    this.examples = ['/adduser', 'Добавить пользователя', '🙎‍♂️ Добавить пользователя'];
    this.onlyAdmin = true;
  }

  help = () => {
    return `${this.examples.join(", ")} — добавляет пользователя. Данные через пробел: chatid, email, admin`;
  }

  reply = async (msg, match) => {
    const chatId = msg.chat.id;
    if (match[1] && match[2] && match[3]) {
      var user = await DB.query(`INSERT INTO bot_accounts VALUES(0, '${match[1]}', '${match[2]}', '${match[3]}')`);
      return { reply: `Пользователь добавлен` };
    } else {
      return { reply: `Сообщение должно иметь вид /adduser 11111 email@example.com 0` };
    }
  }
}

export default new AddUser();