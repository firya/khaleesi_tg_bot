import TelegramBot from "node-telegram-bot-api";

import { hostURL } from "../dev.js";

const token = process.env.TELEGRAM_TOKEN;
const url = `${hostURL}/bot${token}`;

export const telegramBot = new TelegramBot(token);

telegramBot.setWebHook(url);

telegramBot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  const resChance = chatType == "supergroup" ? 3 : 100;

  var nahuiReg = new RegExp("(по[а-ё]+|иди)s(н[а|я]s?х[у|ю]й)", "gi");

  if (msg.hasOwnProperty("text") && !msg.hasOwnProperty("entities")) {
    var responseStatus = Math.random() < resChance / 100;

    if (
      (responseStatus &&
        msg.text.length <= 280 &&
        ((chatType == "supergroup" && msg.text.length >= 21) ||
          chatType == "private")) ||
      nahuiReg.search(msg) != -1
    ) {
      const inputStr = msg.text;

      var mapObj = {
        ошла: "осьля",
        ошиб: "ашип",
        стве: "тьве",
        аешь: "аишь",
        если: "есьи",
        рует: "ует",
        ство: "сьво",
        тебя: "тибя",
        гла: "гйа",
        ные: "ние",
        лич: "лись",
        кош: "кось",
        мар: "маь",
        час: "сяс",
        лам: "лям",
        поч: "пось",
        пря: "пья",
        алу: "ау",
        али: "аи",
        оше: "осё",
        ошё: "осё",
        ячи: "яти",
        так: "тяк",
        что: "сто",
        щас: "сяс",
        оло: "оо",
        ало: "яо",
        оли: "ои",
        ать: "ять",
        дра: "дя",
        вар: "вяй",
        еще: "есё",
        ещё: "есё",
        ишь: "ись",
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
        ста: "стя",
        ипа: "ипя",
        сто: "стё",
        учё: "утё",
        уче: "утё",
        хуй: "хюй",
        шло: "шьо",
        ска: "скя",
        это: "ето",
        для: "дльа",
        жду: "зду",
        все: "фсе",
        слу: "сьу",
        сле: "сье",
        сло: "сьо",
        сла: "сья",
        точ: "тось",
        шир: "щий",
        пло: "пьо",
        гря: "гья",
        бле: "бье",
        але: "айе",
        кно: "кнё",
        чно: "тьно",
        лов: "йов",
        кус: "кусь",
        ец: "есь",
        ру: "ьу",
        еш: "есь",
        ач: "ась",
        ур: "уй",
        чи: "ти",
        ца: "ця",
        ет: "ит",
        жу: "зю",
        ел: "еь",
        иш: "ись",
        цу: "цю",
        за: "зя",
        чё: "тё",
        че: "тё",
        ще: "се",
        ты: "ти",
        ро: "ьо",
        ри: "ьи",
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
        же: "зе",
        ол: "ой",
        го: "гё",
        со: "сё",
        га: "гя",
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
        ра: "йа",
        уг: "ук",
        ис: "ись",
        ъ: "ь",
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
