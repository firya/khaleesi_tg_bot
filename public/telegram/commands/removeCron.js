import DB from '../../db/db.js';
import { listToMatrix, leftPad } from '../../utils.js';

class RemoveCron {
  constructor() {
    this.commands = [/\/removecron[\s]?([\d]+)?$/, /^\/Удалить отчет[\s]?([\d]+)?$/, /^❌ Удалить отчет[\s]?([\d]+)?$/];
    this.examples = ['/removecron', 'Удалить отчет', '❌ Удалить отчет'];

    this.methodList = {
      telegram: 'в телеграм',
      mail: 'на почту'
    };

    this.intervalList = {
      everyday: 'Ежедневный',
      everymonthfirst: 'Ежемесячный, первого числа'
    };

    this.dateAliasList = {
      today: 'сегодня',
      yesterday: 'вчера',
      month: 'этот месяц',
      prevMonth: 'прошлый месяц'
    };

    this.calcMethodList = {
      createdat: 'созданы за',
      meterat: 'назначен замер на',
      closedat: 'закрыты за'
    };
  }

  help = () => {
    return `${this.examples.join(", ")} — удаляет выбранный отчет`;
  }

  reply = async (msg, match) => {
    const chatId = msg.chat.id;

    if (match[1]) {
      await DB.query(`DELETE FROM bot_cron WHERE id='${match[1]}'`);

      return { reply: `Отчет удален` };
    } else {
      var user = await DB.query(`SELECT * FROM bot_accounts WHERE chat_id='${chatId}'`);
      var cronTasks = await DB.query(`SELECT * FROM bot_cron WHERE user_id='${user[0].id}'`);

      var usersKeyboard = cronTasks.map((cronTask, i) => {
        var localTaskTime = cronTask.time.split(":");

        return {
          text: `${this.intervalList[cronTask.interval]} в ${leftPad(parseInt(localTaskTime[0], 10) + 3)}:${localTaskTime[1]}:${localTaskTime[2]} ${this.methodList[cronTask.method]}`,
          callback_data: `/removecron ${cronTask.id}`
        }
      });
      usersKeyboard = listToMatrix(usersKeyboard, 1);
      var opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: usersKeyboard
        })
      };
      return { reply: `Выберите какой отчет удалить`, options: opts };
    }
  }
}

export default new RemoveCron();