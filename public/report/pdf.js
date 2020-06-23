import fs from 'fs';
import request from 'request';
import Handlebars from 'handlebars';
import Report from './report.js';
import { parseDate, dateIntervalToUserView, calcPercent, priceFormat } from '../utils.js';

class PDF {
  constructor() {
    this.token = process.env.PDF_CONVERTER;
    this.hookUrl = `report${this.token}`;
    this.ngrockUrl = 'https://287bea6025a3.eu.ngrok.io';

    this.htmlPath = './static/reports/html';
    this.pdfPath = './static/reports/pdf';

    this.baseUrl = 'http://api.pdflayer.com/api/convert';
    this.url = (process.env.NODE_ENV == 'development') ? `${this.ngrockUrl}/${this.hookUrl}` : `https://${process.env.VIRTUAL_HOST}/${this.hookUrl}`;

    this.methodAliasList = {
      'createdat': {
        func: 'getLeadCreatedAt',
        prefix: 'Замеры созданные за'
      },
      'meterat': {
        func: 'getLeadMeterAt',
        prefix: 'Замеры назначенные на'
      },
      'closedat': {
        func: 'getLeadClosedAt',
        prefix: 'Замеры закрытые за'
      }
    }
  }

  generateHTML = (interval, method = 'closedat') => {
    console.time("Generate HTML");
    return new Promise(async (resolve, reject) => {
      if (fs.existsSync(`${this.htmlPath}/${method}_${interval}.html`)) {
        console.timeEnd("Generate HTML");
        resolve();
      } else {
        var report = new Report();
        var parsedInterval = parseDate(interval);
        var splittedInterval = interval.split('.');

        var monthCount = (splittedInterval.length == 3) ? await report[this.methodAliasList[method].func](parseDate(`01.${splittedInterval[1]}.${splittedInterval[2]}-${splittedInterval[0]}.${splittedInterval[1]}.${splittedInterval[2]}`), true) : 0;
        var data = await report[this.methodAliasList[method].func](parsedInterval);

        var source = await new Promise((resolve, reject) => {
          fs.readFile('./views/notebook.hbs', 'utf8', function (err, data) {
            if (err) {
              reject(err);
            }
            source = data;
            resolve(data);
          })
        });

        var startValue = (monthCount == 0) ? 0 : monthCount - data.total;

        var template = Handlebars.compile(source);

        var data = {
          interval: dateIntervalToUserView(parsedInterval, this.methodAliasList[method].prefix, false),
          common: [
            {
              name: 'Расход',
              value: priceFormat(data.cost)
            }, {
              name: 'Доход',
              value: priceFormat(data.sale)
            }, {
              name: 'Замеров всего',
              value: data.total
            }, {
              name: 'Стоимость замера',
              value: priceFormat(data.cost / data.total)
            }, {
              name: 'Продаж всего',
              value: data.totalSuccess
            }, {
              name: 'Стоимость продажи',
              value: priceFormat(data.cost / data.totalSuccess)
            }, {
              name: 'Съём',
              value: calcPercent(data.totalSuccess, data.total) + "%"
            }, {
              name: 'Средний чек',
              value: priceFormat(data.sale / data.totalSuccess)
            }
          ],
          tables: [
            {
              header: ['Сайты', 'Замеры', 'Продажи', 'Конверсия, %'],
              data: data.bySite.map(site => {
                return [
                  site.name,
                  site.count,
                  (site[142]) ? site[142].count : 0,
                  (site[142]) ? calcPercent(site[142].count, site.count) : 0
                ];
              })
            }, {
              header: ['Менеджеры', 'Замеры', 'Продажи', 'Конверсия, %'],
              data: data.byUser.map(user => {
                return [
                  user.name,
                  user.count,
                  (user[142]) ? user[142].count : 0,
                  (user[142]) ? calcPercent(user[142].count, user.count) : 0
                ];
              })
            }, {
              header: ['Замерщики', 'Замеры', 'Продажи', 'Конверсия, %'],
              data: data.byMeterMaster.map(master => {
                return [
                  master.name,
                  master.count,
                  (master[142]) ? master[142].count : 0,
                  (master[142]) ? calcPercent(master[142].count, master.count) : 0
                ];
              })
            }, {
              header: ['Товары', 'Замеры', 'Продажи', 'Конверсия, %'],
              data: data.byType.map(type => {
                return [
                  type.name,
                  type.count,
                  (type[142]) ? type[142].count : 0,
                  (type[142]) ? calcPercent(type[142].count, type.count) : 0
                ];
              })
            }
          ],
          startValue: startValue,
          data: data.data
        };

        var result = template(data);

        fs.writeFile(`${this.htmlPath}/${method}_${interval}.html`, result, function (err) {
          console.timeEnd("Generate HTML");
          if (err) {
            return console.log(err);
          }

          resolve();
        });
      }
    });
  }

  generatePDF = (interval, method = 'closedat') => {
    console.time("Generate PDF");

    var that = this;

    return new Promise((resolve, reject) => {
      if (fs.existsSync(`${this.pdfPath}/${method}_${interval}.pdf`)) {
        console.timeEnd("Generate PDF");
        resolve();
      } else {
        this.url = `${this.url}?interval=${interval}&calcmethod=${method}`;
        request({
          method: "POST",
          url: this.baseUrl,
          qs: {
            access_key: this.token,
            page_size: 'A4',
            document_url: this.url,
            test: (process.env.NODE_ENV == 'development') ? '1' : false
          },
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          encoding: null
        }, function (err, response, body) {
          console.timeEnd("Generate PDF");
          if (err) {
            return reject(err);
          }
          fs.writeFile(`${that.pdfPath}/${method}_${interval}.pdf`, response.body, (err) => {
            if (err) console.log('error: ', err);
          }, (res) => {
            resolve(res)
          })
        });
      }
    });
  }
}

export default new PDF();