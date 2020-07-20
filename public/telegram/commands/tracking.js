import { amocrm } from '../../amocrm/amocrm.js';
import { inlineFastIntervalSelect } from '../keyboards.js';
import { parseDate, findDateAlias } from '../../utils.js';

class Tracking {
  constructor() {
    this.commands = [/\/tracking[\s]?(.+)?/, /^Отслеживание[\s]?(.+)?/, /^📌 Отслеживание[\s]?(.+)?/];
    this.examples = ['/tracking', 'Отслеживание', '📌 Отслеживание'];
    this.onlyAdmin = true;
  }

  help = () => {
    return `${this.examples.join(", ")} — обновляет параметры отслеживания за указанный интервал дат`;
  }

  reply = async (msg, match) => {
    const chatId = msg.chat.id;
    if (match[1]) {
      const interval = parseDate(findDateAlias(match[1]));

      await amocrm.updateTrackingParams({ interval: interval });

      return { reply: [`Обновлено`] };
    } else {
      var opts = {};
      if (this.examples.length) {
        opts = {
          reply_markup: JSON.stringify({
            inline_keyboard: inlineFastIntervalSelect({ callback_data: this.examples[0] })
          })
        };
      }
      return { reply: [`Выберите интервал`], options: opts };
    }
  }
}

export default new Tracking();