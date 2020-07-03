class MyID {
  constructor() {
    this.commands = [/\/myid/, /^\/id$/, /^id$/, /^ид$/];
    this.examples = ['/myid', '/id', 'id', 'ид'];
  }

  help = () => {
    return `${this.examples.join(", ")} — возвращает ваш ID в телеграме`;
  }

  reply = (msg, match) => {
    const chatId = msg.chat.id;
    return { reply: [`Ваш ID: ${chatId}`] };
  }
}

export default new MyID();