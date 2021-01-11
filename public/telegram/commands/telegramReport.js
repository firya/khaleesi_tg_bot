import { inlineFastIntervalSelect } from "../keyboards.js";
import {
  parseDate,
  dateIntervalToUserView,
  calcPercent,
  priceFormat,
  findDateAlias,
} from "../../utils.js";
import Report from "../../report/report.js";

export default class TelegramReport {
  constructor() {
    this.commands = [];
    this.examples = [];
    this.mainFunction = "getLeadMeterAt";
    this.helpText = "";
    this.prefixText = "";
  }

  help = () => {
    return `${this.examples.join(", ")} — ${this.helpText}`;
  };

  prepareShortAnswer = (data) => {
    var reply = [];
    var domains = ["dveri-2000.ru", "krepostdver.ru"];

    reply.push(`Итог ${Math.round(data.cost / 1000) * 1000}₽`);

    var siteShort = [0, 0];
    console.log(data.bySiteShort);
    data.bySiteShort.map((site) => {
      var position = domains.indexOf(site.name);
      position = position == -1 ? 2 : position;
      siteShort[position] = site.count;
    });
    reply.push(siteShort.join("/"));

    return reply;
  };

  reply = (msg, match) => {
    if (match[1]) {
      const command = match[0].substring(1, /\s/.exec(match[0]).index);
      const interval = parseDate(findDateAlias(match[1]));

      if (interval.from && interval.to) {
        return new Promise(async (resolve, reject) => {
          var report = new Report();
          var data = await report[this.mainFunction](interval);

          var opts = {};

          var reply = [];
          if (data.data) {
            reply.push(`${dateIntervalToUserView(interval, this.prefixText)}`);
            reply.push(`Расход: ${priceFormat(data.cost)}`);
            if (data.sale) {
              reply.push(
                `Доход: ${priceFormat(data.sale)} (средний чек: ${priceFormat(
                  Math.round(data.sale / data.totalSuccess)
                )})`
              );
            }
            reply.push(
              `Замеров всего: ${data.total} (${priceFormat(
                data.cost / data.total
              )}/замер)`
            );
            if (data.totalSuccess) {
              reply.push(
                `Продаж всего: ${data.totalSuccess} (${priceFormat(
                  data.cost / data.totalSuccess
                )}/продажа)`
              );
              reply.push(
                `Съём: ${calcPercent(
                  data.totalSuccess,
                  data.totalDecline + data.totalSuccess
                )}%`
              );
            }
            reply.push(`<b>По статусам</b>:`);
            reply.push(
              data.byStatus
                .map(
                  (status) =>
                    `${status.name}: ${status.count} (${calcPercent(
                      status.count,
                      data.total
                    )}%)`
                )
                .join("\n")
            );
            reply.push(`<b>По сайтам</b>:`);
            reply.push(
              data.bySite
                .map(
                  (site) =>
                    `${site.name}: ${site.count} (${calcPercent(
                      site.count,
                      data.total
                    )}%)`
                )
                .join("\n")
            );
            reply.push(`<b>По товарам</b>:`);
            reply.push(
              data.byType
                .map(
                  (type) =>
                    `${type.name}: ${type.count} (${calcPercent(
                      type.count,
                      data.total
                    )}%)`
                )
                .join("\n")
            );

            opts = {
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {
                      text: `Список сделок`,
                      callback_data: `/leads ${this.mainFunction} ${match[1]}`,
                    },
                    {
                      text: `Отправить на почту`,
                      callback_data: `/mail ${command} ${match[1]}`,
                    },
                  ],
                ],
              }),
            };
          } else {
            reply.push(`Нет информации`);
          }

          reply = [reply.join("\n")];

          if (
            msg.chat?.id == 1690894 &&
            this.mainFunction == "getLeadCreatedAt"
          ) {
            reply.push(this.prepareShortAnswer(data).join("\n"));
          }

          resolve({ reply: reply, options: opts });
        });
      } else {
        return {
          reply: [
            `Неверный формат даты или слишком большой интервал: ${match[1]}`,
          ],
        };
      }
    } else {
      var opts = {};
      if (this.examples.length) {
        opts = {
          reply_markup: JSON.stringify({
            inline_keyboard: inlineFastIntervalSelect({
              callback_data: this.examples[0],
            }),
          }),
        };
      }
      return { reply: [`Выберите интервал`], options: opts };
    }
  };
}
