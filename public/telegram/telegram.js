import TelegramBot from "node-telegram-bot-api";

import { hostURL } from "../dev.js";

const token = process.env.TELEGRAM_TOKEN;
const url = `${hostURL}/bot${token}`;

console.log(url);

export const telegramBot = new TelegramBot(token);

telegramBot.setWebHook(url);

telegramBot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  const resChance = chatType == "supergroup" ? 2 : 100;

  if (msg.hasOwnProperty("text")) {
    var responseStatus = Math.random() < resChance / 100;
    console.log(responseStatus);
    if (responseStatus) {
      const inputStr = msg.text;

      var mapObj = {
        ож: "ёз",
        ор: "ой",
        ер: "ей",
        ль: "й",
        ил: "ий",
        ая: "яя",
        аю: "яю",
        ма: "мя",
        оло: "оо",
        ало: "яо",
        оли: "ои",
        ать: "ять",
        дра: "дя",
        вар: "вяй",
        рь: "й",
        ар: "ай",
        еще: "еси",
        ещё: "еси",
        олл: "ой",
        ол: "ой",
        го: "гё",
        зад: "зяд",
        тал: "тял",
        ан: "ян",
        мог: "мёг",
        каз: "кяз",
        нра: "нья",
        по: "пё",
        со: "сё",
        га: "гя",
        но: "нё",
        во: "вё",
        да: "дя",
        на: "ня",
        мо: "мё",
        ры: "ьы",
        пре: "пье",
        про: "пьё",
        ше: "се",
        че: "те",
        стве: "тьве",
        жи: "зи",
        если: "еси",
        луж: "люзь",
        ом: "ём",
        пра: "пья",
        при: "пьи",
        пла: "пья",
        вле: "вье",
        ре: "йе",
        рует: "ует",
        инг: "инк",
        тра: "тря",
        из: "изь",
      };

      var regex = new RegExp(Object.keys(mapObj).join("|"), "gi");

      var res = inputStr.replace(regex, function (matched) {
        return mapObj[matched.toLowerCase()];
      });

      telegramBot.sendMessage(chatId, res);
    }
  }
});
