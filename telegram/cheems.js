import { Bot } from "node-telegram-bot-api";

const token = process.env.CHEEMS_TELEGRAM_TOKEN;

export const cheemsTelegramBot = new Bot(token);
cheemsTelegramBot.catch((error) => { throw error; });

cheemsTelegramBot.on("message", async (ctx) => {
  const msg = ctx.message;
  const chatType = msg.chat.type;

  const resChance = chatType == "supergroup" ? 2 : 100;

  if (msg.hasOwnProperty("text") && !msg.hasOwnProperty("entities")) {
    var responseStatus = Math.random() < resChance / 100;

    if (
      responseStatus &&
      msg.text.length <= 280 &&
      ((chatType == "supergroup" && msg.text.length >= 21) ||
        chatType == "private")
    ) {
      const inputText = msg.text;

      const consonats = [
        "б",
        "в",
        "г",
        "д",
        "ж",
        "з",
        "к",
        "л",
        "н",
        "п",
        "с",
        "т",
        "ф",
        "х",
        "ц",
        "ч",
        "ш",
        "щ",
      ];
      const vowels = ["а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я"];

      var textSplittedByWord = inputText.split(/[.,:;-_– \n]+/);

      var replaceList = {};
      textSplittedByWord.map((word, i) => {
        word = word.toLowerCase();
        var letters = word.split("");
        var result = "";

        var mCount = 0;
        var mChance = 1;

        for (let i = 0; i < letters.length; i++) {
          var skip = false;

          if (i > 1 && i < letters.length - 1) {
            if (
              (letters[i + 1] == "н" && letters[i] == "н") ||
              (letters[i] == "н" && consonats.indexOf(letters[i + 1]) != -1)
            ) {
              skip = true;
            }
          }
          if (!skip) {
            result += letters[i];
          }
          if (
            letters.length > 2 &&
            ((mCount == 0 && i < letters.length - 1) ||
              (mCount > 0 && letters.length - 2))
          ) {
            if (
              consonats.indexOf(letters[i + 1]) != -1 &&
              vowels.indexOf(letters[i]) != -1
              // && Math.random() <= mChance / (mCount + 1)
            ) {
              result += "м";
              mCount++;
            }
          }
        }
        replaceList[word] = result;
      });

      const words = Object.keys(replaceList).filter(Boolean);
      if (!words.length) return;
      const patterns = words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
      const regex = new RegExp(patterns.join("|"), "gi");

      var res = inputText.replace(regex, function (matched) {
        return replaceList[matched.toLowerCase()];
      });

      await ctx.reply(res, {
        reply_parameters: { message_id: msg.message_id },
      });
    }
  }
});
