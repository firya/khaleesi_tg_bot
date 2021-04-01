import TelegramBot from "node-telegram-bot-api";
import natural from "natural";

import { hostURL } from "../dev.js";
import https from "https";

import replaces from "./replaces.js";

import SentimentAnalyzer from "../nlp.js";
const sentimentAnalyzer = new SentimentAnalyzer();

const token = process.env.KHALEESI_TELEGRAM_TOKEN;
const debugChatId = process.env.DEBUG_CHAT_ID;
const url = `${hostURL}/bot${token}`;

export const khaleesiTelegramBot = new TelegramBot(token);

const dashbotToken = process.env.DASHBOT_API_TOKEN;

const minLengthGroup = 21;
const JaroWinklerLimit = 0.95;

khaleesiTelegramBot.setWebHook(url);

khaleesiTelegramBot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  const resChance = chatType == "supergroup" ? 5 : 100;

  if (msg.hasOwnProperty("text") && !msg.hasOwnProperty("entities")) {
    var responseStatus = Math.random() < resChance / 100;
    var sentimentScore = 0;

    if (chatType == "supergroup") {
      var sentiment = sentimentAnalyzer.getSentiment(msg.text, true);
      sentimentScore = sentiment.score;
      var lengthMultiplier =
        msg.text.length > minLengthGroup
          ? 1
          : msg.text.length / (minLengthGroup * 2);

      if (sentimentScore < 0) {
        responseStatus =
          Math.random() <
          (resChance * (Math.abs(sentimentScore) + 1) * lengthMultiplier) / 100;
      } else {
        responseStatus = false;
      }
    }

    if (
      msg.text.indexOf("?") == -1 &&
      responseStatus &&
      msg.text.length <= 140 &&
      (chatType == "private" || chatType == "supergroup")
    ) {
      const inputStr = msg.text;

      var regex = new RegExp(Object.keys(replaces).join("|"), "gi");

      var res = inputStr.replace(regex, function (matched) {
        return replaces[matched.toLowerCase()];
      });

      if (
        chatType != "supergroup" ||
        (chatType == "supergroup" &&
          natural.JaroWinklerDistance(msg.text, res) < JaroWinklerLimit)
      ) {
        khaleesiTelegramBot.sendMessage(chatId, res, {
          reply_to_message_id: msg.message_id,
        });
        khaleesiTelegramBot.sendMessage(
          debugChatId,
          `Message: ${msg.text}
Sentiment: ${sentimentScore}
Jaro–Winkler: ${natural.JaroWinklerDistance(msg.text, res)}
Response: ${res}`
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
