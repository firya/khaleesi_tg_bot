import TelegramReport from './telegramReport.js';

class ClosedAt extends TelegramReport {
  constructor(props) {
    super(props);

    this.commands = [/\/closedat[\s]?(.+)?/, /^Закрытые[\s]?(.+)?/, /^🚪 Закрытые[\s]?(.+)?/];
    this.examples = [`/closedat`, 'Закрытые', '🚪 Закрытые'];
    this.mainFunction = 'getLeadClosedAt';
    this.helpText = 'возвращает замеры ЗАКРЫТЫЕ за указанный интервал';
    this.prefixText = 'Замеры закрытые за';
  }
}

export default new ClosedAt();