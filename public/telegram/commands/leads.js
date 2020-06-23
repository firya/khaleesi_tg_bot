import { inlineDayKeyboard } from '../keyboards.js';
import { parseDate, findDateAlias } from '../../utils.js';
import Report from '../../report/report.js';

class Leads {
  constructor() {
    this.commands = [/\/leads[\s]?(.+)[\s]([\d\.]+)?/, /^Сделки[\s]?(.+)[\s]([\d\.]+)?/, /^📖 Сделки[\s]?(.+)[\s]([\d\.]+)?/];
    this.examples = [`/leads`, 'Сделки', ' 📖 Сделки'];
  }

  help = () => {
    return `${this.examples.join(", ")} — возвращает список сделок за указанный интервал дат указанным методом. /leads метод интервал`;
  }

  reply = (msg, match) => {
    if (match[2]) {
      const interval = parseDate(findDateAlias(match[2]));
      if (interval.from && interval.to) {
        return new Promise(async (resolve, reject) => {
          var report = new Report();
          var data = await report[match[1]](interval);

          var reply = [];
          if (data.data) {
            reply.push(data.data.map((lead, i) => {
              return [
                `${(i + 1)}. Сделка ${lead.itemType}: <a href='https://universalstal.amocrm.ru/leads/detail/${lead.id}'>${lead.id}</a> (${lead.createdAt})`,
                `Сайт: ${lead.site}`,
                `Статус: ${lead.status.name}`,
                `Замер: ${lead.meterDate} (${lead.meterTime})`,
                `Замерщик: ${lead.meterMaster}`,
                `Адрес: ${lead.address}`,
                `Клиент: ${lead.contact.name}, ${lead.contact.phones.map(phone => phone).join(', ')}`,
                `Коментарий: ${lead.meterInfo}`
              ].join('\n')
            }).join('\n\n'));
          } else {
            reply.push(`Нет информации`)
          }

          resolve({ reply: reply.join('\n') });
        });
      } else {
        return { reply: `Неверный формат даты: ${match[2]}` };
      }
    } else {
      const opts = {
        reply_markup: JSON.stringify({
          inline_keyboard: inlineDayKeyboard({ callback_data: '/leads' })
        })
      };
      return { reply: `Выберите день`, options: opts };
    }
  }
}

export default new Leads();