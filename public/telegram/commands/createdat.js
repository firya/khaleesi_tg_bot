import TelegramReport from './telegramReport.js';

class CreatedAt extends TelegramReport {
  constructor(props) {
    super(props);

    this.commands = [/\/createdat[\s]?(.+)?/, /^Созданные[\s]?(.+)?/, /^📱 Созданные[\s]?(.+)?/];
    this.examples = [`/createdat`, 'Созданные', '📱 Созданные'];
    this.mainFunction = 'getLeadCreatedAt';
    this.helpText = 'возвращает замеры СОЗДАННЫЕ за указанный интервал';
    this.prefixText = 'Замеры созданные за';
  }
}

export default new CreatedAt();