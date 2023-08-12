import express from "express";
import path from "path";

import { khaleesiTelegramBot } from "./telegram/khaleesi.js";
import { cheemsTelegramBot } from "./telegram/cheems.js";

const __dirname = path.resolve(path.dirname(""));

var app = express();

app.use(express.urlencoded());
app.use(express.json());
app.set("view engine", "hbs");
app.use(express.static("static"));

app.get("/", function (req, res) {
  res.send("Здесь ничего нет, уходите!");
});

app.post(`/bot${process.env.KHALEESI_TELEGRAM_TOKEN}`, (req, res) => {
  khaleesiTelegramBot.processUpdate(req.body);
  res.sendStatus(200);
});

app.post(`/bot${process.env.CHEEMS_TELEGRAM_TOKEN}`, (req, res) => {
  cheemsTelegramBot.processUpdate(req.body);
  res.sendStatus(200);
});

app.listen(8080, function () {
  console.log("Example app listening on port 8080!");
});
