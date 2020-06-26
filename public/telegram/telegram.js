import TelegramBot from 'node-telegram-bot-api';

import MeterAt from './commands/meterat.js';
import CreatedAt from './commands/createdat.js';
import ClosedAt from './commands/closedat.js';
import Leads from './commands/leads.js';
import MailReport from './commands/mail.js';

import AddCron from './commands/addCron.js';
import RemoveCron from './commands/removeCron.js';

import AddUser from './commands/addUser.js';
import RemoveUser from './commands/removeUser.js';

import MyID from './commands/myid.js';
import Help from './commands/help.js';

import DB from '../db/db.js';

import { defaultKeyboard } from './keyboards.js';

const token = process.env.TELEGRAM_TOKEN;
const hookUrl = `bot${token}`;
const ngrockUrl = 'https://7fc43bcd59c2.eu.ngrok.io'; // for local use
const url = (process.env.NODE_ENV == 'development') ? `${ngrockUrl}/${hookUrl}` : `https://${process.env.VIRTUAL_HOST}/${hookUrl}`;
const defaultAnswer = `Мы сообщили о вас куда следует`;
const commandList = [MyID, CreatedAt, MeterAt, ClosedAt, Leads, MailReport, AddCron, RemoveCron, AddUser, RemoveUser];

export const telegramBot = new TelegramBot(token);

telegramBot.setWebHook(url);

commandList.map((obj, i) => {
  obj.commands.map((command, j) => {
    telegramBot.onText(command, async (msg, match) => {
      const chatId = msg.chat.id;
      var permission = await checkPermission(msg);
      if (permission) {
        const { reply, options } = await obj.reply(msg, match);

        telegramBot.sendMessage(chatId, reply, {
          ...options,
          parse_mode: 'HTML'
        });
      } else {
        telegramBot.sendMessage(chatId, defaultAnswer);
      }
    });
  });
});

export const telegramBotTrigger = (chatId, trigger) => {

  new Promise((resolve, reject) => {
    commandList.map((obj, i) => {
      obj.commands.map(async (command, j) => {
        var match = trigger.match(command);
        if (match) {
          const { reply, options } = await obj.reply({}, match);
          telegramBot.sendMessage(chatId, reply, {
            ...options,
            parse_mode: 'HTML'
          });
          resolve();
        }
      });
    });
  });
}

telegramBot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;

  commandList.map((obj, i) => {
    obj.commands.map(async (command, j) => {
      var match = action.match(command)
      if (match) {
        var permission = await checkPermission(msg);
        if (permission) {
          const { reply, options } = await obj.reply(msg, match);
          telegramBot.sendMessage(chatId, reply, {
            ...options,
            parse_mode: 'HTML'
          });
        } else {
          telegramBot.sendMessage(chatId, defaultAnswer);
        }
      }
    });
  });
});

telegramBot.onText(/\/help/, async (msg, match) => {
  const chatId = msg.chat.id;

  var user = await DB.query(`SELECT * FROM bot_accounts WHERE chat_id='${chatId}'`);
  var isAdmin = (user[0].admin) ? true : false;

  const { reply } = Help.reply(commandList, isAdmin);
  var permission = await checkPermission(msg);
  if (permission) {
    telegramBot.sendMessage(chatId, reply, {
      parse_mode: 'HTML',
      reply_markup: JSON.stringify({
        keyboard: defaultKeyboard(isAdmin)
      })
    });
  } else {
    telegramBot.sendMessage(chatId, defaultAnswer);
  }
});

const checkPermission = async (msg) => {
  const chatId = msg.chat.id;

  var user = await DB.query(`SELECT * FROM bot_accounts WHERE chat_id='${chatId}'`);
  var permission = (user.length) ? true : false;

  if (!permission) {
    var admin = await DB.query('SELECT * FROM `bot_accounts` WHERE admin=1');
    var reply = [];
    reply.push(`Там какой-то придурок ломится в будку:`);
    reply.push(`ID: ${chatId}`);
    reply.push(`${msg.chat.first_name} ${msg.chat.last_name} (${msg.chat.username})`);
    telegramBot.sendMessage(admin[0].chat_id, reply.join('\n'));
  }

  return permission;
}