class Help {
  constructor() {
  }

  reply = (commandList, admin = false) => {
    var reply = [];

    reply.push('Доступные команды:');

    commandList.map((obj, i) => {
      if (!obj.onlyAdmin || (obj.onlyAdmin && admin)) {
        reply.push("— " + obj.help());
      }
    });

    reply.push('\nКак интервал дат во всех функциях принимается строка вида:');
    reply.push('— 01.01.2020-10.01.2020');
    reply.push('— 01.01.2020');
    reply.push('— 01.2020');

    return { reply: [reply.join("\n")] };
  }
}

export default new Help();