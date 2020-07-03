import DB from '../../db/db.js';
import { listToMatrix } from '../../utils.js';

class RemoveUser {
  constructor() {
    this.commands = [/\/removeuser[\s]?([\d]+)?$/, /^\/Remove User[\s]?([\d]+)?$/, /^💀 Remove User[\s]?([\d]+)?$/];
    this.examples = ['/removeuser', 'Remove User', '💀 Remove User'];
    this.onlyAdmin = true;
  }

  help = () => {
    return `${this.examples.join(", ")} — добавляет пользователя. Данные через пробел: chatid, email, admin`;
  }

  reply = async (msg, match) => {
    const chatId = msg.chat.id;
    if (match[1]) {
      await DB.query(`DELETE FROM bot_accounts WHERE id='${match[1]}'`);

      return { reply: [`Пользователь удален`] };
    } else {
      var userList = await DB.query(`SELECT * FROM bot_accounts WHERE chat_id!='${chatId}'`);

      var usersKeyboard = userList.map((user, i) => {
        return {
          text: `${user.chat_id} : ${user.email}`,
          callback_data: `${this.examples[0]} ${user.id}`
        }
      });

      usersKeyboard = listToMatrix(usersKeyboard, 3);

      var opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: usersKeyboard
        })
      };
      return { reply: [`Выберите пользователя`], options: opts };
    }
  }
}

export default new RemoveUser();