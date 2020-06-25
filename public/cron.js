import Cron from 'cron';
import DB from './db/db.js';
import { telegramBotTrigger } from './telegram/telegram.js';
import { parseDate, findDateAlias, dateIntervalToUserView } from './utils.js';
import Mail from './mail/mail.js';
import PDF from './report/pdf.js';

var CheckReportEveryMinute = new Cron.CronJob('*/60 * * * * *', async () => {
  var cronTasks = await DB.query('SELECT * FROM `bot_cron`');

  for (let i = 0; i < cronTasks.length; i++) {
    if (cronIntervalItsTime(cronTasks[i])) {
      var user = await DB.query(`SELECT * FROM bot_accounts WHERE id=${cronTasks[i].user_id}`);

      const curentDateMysql = (new Date()).toISOString().split(/[T\.]/).slice(0, 2).join(' ');

      if (cronTasks[i].method == 'telegram') {
        var chatId = user[0].chat_id;
        telegramBotTrigger(chatId, cronTasks[i].command);
      } else if (cronTasks[i].method == 'mail') {
        var mailto = user[0].email;
        var matches = cronTasks[i].command.match(/\/([a-z]+)[\s]?(.+)?/);

        var date = findDateAlias(matches[2]);
        var subject = dateIntervalToUserView(parseDate(date), 'Отчет за', false);

        PDF.generateHTML(date, matches[1]).then(() => {
          PDF.generatePDF(date, matches[1]).then(() => {
            Mail.send(mailto, subject, subject, [
              {
                filename: `${matches[1]}_${date}.pdf`,
                path: `./static/reports/pdf/${matches[1]}_${date}.pdf`
              }
            ]);
          });
        });
      }

      DB.query(`UPDATE bot_cron set last_run='${curentDateMysql}' WHERE id='${cronTasks[i].id}'`);
    }
  }
}, null, true, 'Europe/Moscow');

const cronIntervalItsTime = (cron) => {
  var currentDate = new Date();
  var currentUnixTime = currentDate.getTime() / 1000;
  var currentSeconds = currentDate.getHours() * 60 * 60 + currentDate.getMinutes() * 60 + currentDate.getSeconds();

  var crontime = cron.time.split(/[\:]/);
  var cronSeconds = crontime[0] * 60 * 60 + crontime[1] * 60 + parseInt(crontime[2], 10);
  var cronLastRunTime = (cron.last_run) ? new Date(cron.last_run).getTime() / 1000 : false;

  var cronTaskRunTime = 30 * 60; //30 minutes for cron task

  switch (cron.interval) {
    case 'everyday':
      if ((!cronLastRunTime || (cronLastRunTime && cronLastRunTime + 60 * 60 * 24 - cronTaskRunTime < currentUnixTime)) && cronSeconds < currentSeconds) {
        return true;
      } else {
        return false;
      }
      break;
    case 'everymonthfirst':
      if ((!cronLastRunTime || (cronLastRunTime && new Date(cron.last_run).getMonth() < currentDate.getMonth())) && cronSeconds < currentSeconds) {
        return true;
      } else {
        return false;
      }
      break;
    default:
      return false;
      break;
  }
}