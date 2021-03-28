import TelegramBot from "node-telegram-bot-api";

import { hostURL } from "../dev.js";
import https from "https";

import SentimentAnalyzer from "../nlp.js";
const sentimentAnalyzer = new SentimentAnalyzer();

const token = process.env.KHALEESI_TELEGRAM_TOKEN;
const url = `${hostURL}/bot${token}`;

export const khaleesiTelegramBot = new TelegramBot(token);

const dashbotToken = process.env.DASHBOT_API_TOKEN;

khaleesiTelegramBot.setWebHook(url);

khaleesiTelegramBot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  const resChance = chatType == "supergroup" ? 10 : 100;

  if (msg.hasOwnProperty("text") && !msg.hasOwnProperty("entities")) {
    var responseStatus = Math.random() < resChance / 100;
    var sentiment = 0;

    if (chatType == "supergroup") {
      sentiment = sentimentAnalyzer.getSentiment(msg.text);

      if (sentiment < 0) {
        responseStatus =
          Math.random() < (resChance * (Math.abs(sentiment) + 1)) / 100;
      } else {
        responseStatus = false;
      }
    }

    if (
      responseStatus &&
      msg.text.length <= 280 &&
      (chatType == "private" ||
        (chatType == "supergroup" && msg.text.length >= 21))
    ) {
      const inputStr = msg.text;

      var mapObj = {
        ошла: "осьля",
        ошиб: "ашип",
        себя: "сипя",
        стве: "тьве",
        аешь: "аишь",
        если: "есьи",
        рует: "ует",
        ство: "сьво",
        тебя: "тибя",
        меня: "миня",
        были: "быйи",
        воря: "войа",
        сыла: "сыа",
        будь: "буть",
        есть: "есь",
        шлют: "слють",
        бля: "бьйа",
        вка: "фка",
        чну: "сьну",
        пля: "пьйа",
        под: "пот",
        нет: "нит",
        тив: "тивь",
        удо: "удьо",
        уст: "усьть",
        чат: "чят",
        "ну ": "ню ",
        мне: "мьне",
        там: "тям",
        жоп: "зёп",
        бря: "бья",
        нце: "ньте",
        бли: "бьи",
        очу: "отю",
        гла: "гйа",
        гля: "гйа",
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
        тут: "туть",
        кой: "кёй",
        кто: "ктё",
        то: "тьо",
        ец: "есь",
        ру: "ьу",
        еш: "есь",
        ач: "ась",
        ур: "уй",
        чи: "ти",
        ца: "ця",
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
        бы: "би",
        чо: "тё",
        жд: "зьд",
        зд: "сьд",
        вы: "ви",
        "в ": "вь ",
        ъ: "ь",
      };

      var regex = new RegExp(Object.keys(mapObj).join("|"), "gi");

      var res = inputStr.replace(regex, function (matched) {
        return mapObj[matched.toLowerCase()];
      });

      if (chatType != "supergroup") {
        khaleesiTelegramBot.sendMessage(chatId, res, {
          reply_to_message_id: msg.message_id,
        });
      } else {
        khaleesiTelegramBot.sendMessage(
          1690894,
          `Message: ${msg.text}
      Sentiment: ${sentiment}
      Response: ${res}
Response: ${responseStatus}`
        );
      }

      sendStat("outgoing", msg, res);
    }
  }
});

function sendStat(type, msg, replay = "") {
  var chatName = msg.chat.type == "supergroup" ? msg.chat.title : "private";
  const data = JSON.stringify({
    text: replay,
    userId: chatName,
  });

  const options = {
    hostname: "tracker.dashbot.io",
    port: 443,
    path: `/track?platform=universal&v=11.1.1-rest&type=${type}&apiKey=${dashbotToken}`,
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  };

  const req = https.request(options, (res) => {
    res.on("data", (d) => {
      process.stdout.write(d);
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(data);
  req.end();
}
