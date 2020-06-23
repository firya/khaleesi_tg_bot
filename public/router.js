import express from 'express';
import path from 'path';
import url from 'url';

import { telegramBot } from './telegram/telegram.js';

const __dirname = path.resolve(path.dirname(''));

var app = express();

app.use(express.json());
app.set("view engine", "hbs");
app.use(express.static('static'));

app.get('/', function (req, res) {
  res.send('Здесь ничего нет, уходите!');
});

app.post(`/bot${process.env.TELEGRAM_TOKEN}`, (req, res) => {
  telegramBot.processUpdate(req.body);
  res.sendStatus(200);
});

app.use(`/report${process.env.PDF_CONVERTER}`, async (req, res) => {
  var queryParams = url.parse(req.url, true).query;
  res.sendFile(`static/reports/html/${queryParams.calcmethod}_${queryParams.interval}.html`, {
    root: path.join(__dirname, './')
  })
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});