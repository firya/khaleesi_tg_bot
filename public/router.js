import express from 'express';
import path from 'path';
import url from 'url';

import { telegramBot } from './telegram/telegram.js';

import LeadHook from './amocrm/leadHook.js';
import CreateHook from './amocrm/createHook.js';
import MetrikaHook from './amocrm/metrikaHook.js';
import RoistatHook from './roistat/roistatHook.js';

const __dirname = path.resolve(path.dirname(''));

var app = express();

app.use(express.urlencoded());
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

app.use(`/amocrm_webhook_lead_status_meter`, async (req, res) => {
  LeadHook.leadMeterWebhook(req.body)
  res.sendStatus(200);
});

app.use(`/amocrm_webhook_lead_created`, async (req, res) => {
  CreateHook.createWebhook(req.body)
  res.sendStatus(200);
});

app.use(`/amocrm_webhook_metrika_meter`, async (req, res) => {
  MetrikaHook.metrikaMeterWebHook(req.body)
  res.sendStatus(200);
});

app.use(`/amocrm_webhook_metrika_sale`, async (req, res) => {
  MetrikaHook.metrikaSaleWebHook(req.body)
  res.sendStatus(200);
});

app.use(`/roistat_webhook`, async (req, res) => {
  RoistatHook.roistatNewCallHook(req.body)
  res.sendStatus(200);
});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!');
});