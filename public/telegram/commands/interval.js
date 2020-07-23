import { inlineIntervalKeyboard } from '../keyboards.js';
import { parseDate, brakeInterval, findDateAlias, joinReplayByMaxLength, priceFormat, dateIntervalToUserView } from '../../utils.js';
import Report from '../../report/report.js';

class Inteval {
  constructor() {
    this.commands = [/\/interval[\s]?(.+)?/, /^Интервал[\s]?(.+)?/, /^⏳ Интервал[\s]?(.+)?/];
    this.examples = [`/interval`, 'Интервал', '⏳ Интервал'];
  }

  help = () => {
    return `${this.examples.join(", ")} — возвращает краткую сводку по созданным замерам за интервал дат`;
  }

  reply = (msg, match) => {
    if (match[1]) {
      const interval = parseDate(findDateAlias(match[1]));
      if (interval.from && interval.to) {
        return new Promise(async (resolve, reject) => {
          var report = new Report();

          var intervalList = brakeInterval(interval);

          var reply = [];
          for await (let intervalItem of intervalList) {
            var result = await report.getLeadCreatedAt(intervalItem);

            if (result.cost) {
              reply.push([
                `${dateIntervalToUserView(intervalItem, '')}: ${priceFormat(result.cost)}, ${result.data.length} замеров (${priceFormat(result.cost / result.total)}/замер)`
              ])
            }
          }

          reply = joinReplayByMaxLength(reply);

          resolve({ reply: reply });
        });
      } else {
        return { reply: `Неверный формат даты или слишком большой интервал: ${match[2]}` };
      }
    } else {
      const opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: inlineIntervalKeyboard({ callback_data: '/interval' })
        })
      };
      return { reply: [`Выберите интервал`], options: opts };
    }
  }
}

export default new Inteval();