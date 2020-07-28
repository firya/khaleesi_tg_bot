import './router.js';
import './cron.js';

// import Report from './report/report.js';
// import { parseDate, leftPad } from './utils.js';
// var report = new Report();

// const testDates = async () => {
//   var d = new Date();

//   for (let i = 0; i < 20; i++) {
//     var day = leftPad(d.getDate(), 2);
//     var month = leftPad(d.getMonth() + 1, 2);
//     var year = d.getFullYear();

//     var date = parseDate(`${day}.${month}.${year}`);

//     var resultOld = await report.getLeadCreatedAt(date, true, true);
//     var resultNew = await report.getLeadCreatedAt(date, true, false);

//     console.log(`${day}.${month}.${year}`, resultOld, resultNew);
//     d.setDate(d.getDate() - 1);
//   }
// }

// testDates();