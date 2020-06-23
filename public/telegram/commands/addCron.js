import DB from '../../db/db.js';
import { listToMatrix } from '../../utils.js';
import { inlineTimeKeyboard } from '../keyboards.js';

class AddCron {
  constructor() {
    this.commands = [/^\/addcron[\s]?([a-z]+)?[\s]?([a-z]+)?[\s]?([0-9\:]+)?[\s]?([a-z]+)?[\s]?([a-z]+)?$/, /^Добавить отчет[\s]?([a-z]+)?[\s]?([a-z]+)?[\s]?([0-9\:]+)?[\s]?([a-z]+)?[\s]?([a-z]+)?$/, /^⏱ Добавить отчет[\s]?([a-z]+)?[\s]?([a-z]+)?[\s]?([0-9\:]+)?[\s]?([a-z]+)?[\s]?([a-z]+)?$/];
    this.examples = ['/addcron', 'Добавить отчет', '⏱ Добавить отчет'];

    this.methodList = {
      telegram: 'В телеграм',
      mail: 'На почту'
    };

    this.intervalList = {
      everyday: 'Каждый день',
      everymonthfirst: 'Раз в месяц, первого числа'
    };

    this.dateAliasList = {
      today: 'Сегодня',
      yesterday: 'Вчера',
      month: 'Этот месяц',
      prevmonth: 'Прошлый месяц'
    };

    this.calcMethodList = {
      createdat: 'Созданы за',
      meterat: 'Назначен замер на',
      closedat: 'Закрыты за'
    };
  }

  help = () => {
    return `${this.examples.join(", ")} — добавляет отправку отчета в телеграм или на почту`;
  }

  reply = async (msg, match) => {
    const chatId = msg.chat.id;

    console.log(match)

    if (match[1] && match[2] && match[3] && match[4] && match[5]) {
      var user = await DB.query(`SELECT * FROM bot_accounts WHERE chat_id='${chatId}'`);

      await DB.query(`INSERT INTO bot_cron VALUES(0, '${user[0].id}', '${match[3]}', '${match[2]}', '1970-01-01 00:00:00', '/${match[4]} ${match[5]}', '${match[1]}')`);

      return { reply: `Отчет добавлен` };
    } else if (match[1] && match[2] && match[3] && match[4]) {
      var usersKeyboard = Object.keys(this.dateAliasList).map((key, i) => {
        return {
          text: `${this.dateAliasList[key]}`,
          callback_data: `/addcron ${match[1]} ${match[2]} ${match[3]} ${match[4]} ${key}`
        }
      });
      usersKeyboard = listToMatrix(usersKeyboard, 2);
      var opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: usersKeyboard
        })
      };
      return { reply: `За какой период?`, options: opts };
    } else if (match[1] && match[2] && match[3]) {
      var usersKeyboard = Object.keys(this.calcMethodList).map((key, i) => {
        return {
          text: `${this.calcMethodList[key]}`,
          callback_data: `/addcron ${match[1]} ${match[2]} ${match[3]} ${key}`
        }
      });
      usersKeyboard = listToMatrix(usersKeyboard, 2);
      var opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: usersKeyboard
        })
      };
      return { reply: `Какой отчет нужно присылать?`, options: opts };
    } else if (match[1] && match[2]) {
      var opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: inlineTimeKeyboard({ callback_data: `/addcron ${match[1]} ${match[2]}` })
        })
      };
      return { reply: `В какое время?`, options: opts };
    } else if (match[1]) {
      var usersKeyboard = Object.keys(this.intervalList).map((key, i) => {
        return {
          text: `${this.intervalList[key]}`,
          callback_data: `/addcron ${match[1]} ${key}`
        }
      });
      usersKeyboard = listToMatrix(usersKeyboard, 2);
      var opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: usersKeyboard
        })
      };
      return { reply: `Когда нужно присылать отчет?`, options: opts };
    } else {
      var usersKeyboard = Object.keys(this.methodList).map((key, i) => {
        return {
          text: `${this.methodList[key]}`,
          callback_data: `/addcron ${key}`
        }
      });
      usersKeyboard = listToMatrix(usersKeyboard, 2);
      var opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: usersKeyboard
        })
      };
      return { reply: `Выберите способ получения отчета`, options: opts };
    }
  }
}

export default new AddCron();