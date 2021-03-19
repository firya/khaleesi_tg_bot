import TelegramBot from "node-telegram-bot-api";

import { hostURL } from "../dev.js";

const token = process.env.TELEGRAM_TOKEN;
const url = `${hostURL}/bot${token}`;

export const telegramBot = new TelegramBot(token);

telegramBot.setWebHook(url);

telegramBot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  const resChance = chatType == "supergroup" ? 5 : 100;

  if (msg.hasOwnProperty("text") && !msg.hasOwnProperty("entities")) {
    var responseStatus = Math.random() < resChance / 100;

    if (responseStatus && msg.text.length > 42) {
      const inputStr = msg.text;

      var mapObj = {
        стве: "тьве",
        если: "еси",
        рует: "ует",
        оло: "оо",
        ало: "яо",
        оли: "ои",
        ать: "ять",
        дра: "дя",
        вар: "вяй",
        еще: "еси",
        ещё: "еси",
        олл: "ой",
        зад: "зяд",
        тал: "тял",
        мог: "мёг",
        каз: "кяз",
        нра: "нья",
        пре: "пье",
        про: "пьё",
        луж: "люзь",
        пра: "пья",
        при: "пьи",
        пла: "пья",
        вле: "вье",
        инг: "инк",
        тра: "тря",
        дли: "дьи",
        ще: "се",
        из: "изь",
        ож: "ёз",
        ор: "ой",
        ер: "ей",
        ль: "й",
        ил: "ий",
        ая: "яя",
        аю: "яю",
        ма: "мя",
        рь: "й",
        ар: "ай",
        ол: "ой",
        го: "гё",
        ан: "ян",
        по: "пё",
        со: "сё",
        га: "гя",
        но: "нё",
        во: "вё",
        да: "дя",
        на: "ня",
        мо: "мё",
        ры: "ьы",
        ше: "се",
        че: "те",
        жи: "зи",
        ом: "ём",
        ре: "йе",
      };

      var regex = new RegExp(Object.keys(mapObj).join("|"), "gi");

      var res = inputStr.replace(regex, function (matched) {
        return mapObj[matched.toLowerCase()];
      });

      telegramBot.sendMessage(chatId, res, {
        reply_to_message_id: msg.message_id,
      });
    }
  }
});
