import './router.js';
import './cron.js';

// import { parseDate, brakeInterval, timestampToDate } from './utils.js';
// import Report from './report/report.js';

// const test = async () => {
//   var interval = parseDate('18.06.2020-22.06.2020');
//   var intervalList = brakeInterval(interval);

//   var report = new Report();
//   for await (let intervalItem of intervalList) {
//     report.getLeadCreatedAt(intervalItem).then(res => console.log(res.data.length, res.cost));
//   }
// }
// test();

// console.log(interval);
// amocrm.updateTrackingParams({ interval: interval });

// amocrm.getAllEntities('leads', {
// }).then(leads => {
//   leads.map(lead => {
//     amocrm.getTrackingParams(lead).then(res => {
//       // console.log(res)
//     });
//   });
// });


// import { parseDate } from './utils.js';
// import Report from './report/report.js';

// var interval = parseDate('01.07.2020-09.07.2020');

// var report = new Report();
// report.getLeadMeterAtWithoutHack(interval).then(res => {
//   console.log(res)
// });

// import { roistat } from './roistat/roistat.js';
// import { clearPhone } from './utils.js';
// roistat.addCall({
//   caller: '79999999999',
//   callee: '74951501130',
//   roistat: '368111',
// })
// roistat.getCallerByPhone('79257878008').then(res => console.log(res));