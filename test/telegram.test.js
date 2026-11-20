import assert from "node:assert/strict";
import test from "node:test";

test("both webhooks reply to the original private message", async (t) => {
  process.env.KHALEESI_TELEGRAM_TOKEN = "123456:test";
  process.env.CHEEMS_TELEGRAM_TOKEN = "123457:test";
  t.mock.method(globalThis, "fetch", () => { throw new Error("Unexpected network access"); });
  const { khaleesiTelegramBot } = await import("../telegram/khaleesi.js");
  const { cheemsTelegramBot } = await import("../telegram/cheems.js");
  for (const bot of [khaleesiTelegramBot, cheemsTelegramBot]) {
    t.mock.method(bot.api, "getMe", async () => ({ id: 1, is_bot: true, first_name: "Test", username: "testbot" }));
    const send = t.mock.method(bot.api, "sendMessage", async () => ({}));
    const message = { message_id: 42, chat: { id: 7, type: "private" }, date: 1, text: "Привет (мир)" };
    await bot.handleUpdate({ update_id: 1, message });
    assert.equal(send.mock.callCount(), 1);
    const [reply] = send.mock.calls[0].arguments;
    assert.equal(reply.chat_id, 7);
    assert.equal(reply.reply_parameters.message_id, 42);
    assert.ok(reply.text.length > 0);
    await bot.handleUpdate({ update_id: 2, message: { ...message, entities: [{ type: "bold", offset: 0, length: 1 }] } });
    assert.equal(send.mock.callCount(), 1);
  }
});
