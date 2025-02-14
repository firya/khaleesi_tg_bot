import TelegramBot from "node-telegram-bot-api";
import natural from "natural";

import { hostURL } from "../dev.js";

import replaces from "./replaces.js";

import SentimentAnalyzer from "../nlp.js";
const sentimentAnalyzer = new SentimentAnalyzer();

const token = process.env.KHALEESI_TELEGRAM_TOKEN;
const url = `${hostURL}/bot${token}`;

export const khaleesiTelegramBot = new TelegramBot(token);

const minLengthGroup = 21;
const JaroWinklerLimit = 0.95;

khaleesiTelegramBot.setWebHook(url);

khaleesiTelegramBot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const chatType = msg.chat.type;

  const resChance = chatType == "supergroup" ? 3 : 100;

  if (msg.hasOwnProperty("text") && !msg.hasOwnProperty("entities")) {
    var responseStatus = Math.random() < resChance / 100;
    var sentimentScore = 0;
    var sentiment = null;
    var chance = 1;

    if (chatType == "supergroup") {
      sentiment = sentimentAnalyzer.getSentiment(msg.text, true);
      sentimentScore = sentiment.score;
      var lengthMultiplier =
        msg.text.length > minLengthGroup ? 1 : msg.text.length / minLengthGroup;

      var chance =
        (resChance * (Math.abs(sentimentScore) + 1) * lengthMultiplier) / 100;

      if (sentimentScore < 0) {
        responseStatus = Math.random() < chance;
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
        //         var stems =
        //           sentiment && sentiment.info ? sentiment.info.join("; ") : "";
        //         khaleesiTelegramBot.sendMessage(
        //           debugChatId,
        //           `Message: ${msg.text}
        // Sentiment: ${sentimentScore}
        // Jaro–Winkler: ${natural.JaroWinklerDistance(msg.text, res)}
        // Response: ${res}
        // Stems: ${stems}
        // Chance: ${chance}`
        //         );
      }
    }
  }
});

