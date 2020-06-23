import TelegramReport from './telegramReport.js';

class MeterAt extends TelegramReport {
  constructor(props) {
    super(props);

    this.commands = [/\/meterat[\s]?(.+)?/, /^Назначенные[\s]?(.+)?/, /^📏 Назначенные[\s]?(.+)?/];
    this.examples = [`/meterat`, 'Назначенные', '📏 Назначенные'];
    this.mainFunction = 'getLeadMeterAt';
    this.helpText = 'возвращает замеры НАЗНАЧЕННЫЕ на указанный интервал';
    this.prefixText = 'Замеры назначенные на';
  }
}

export default new MeterAt();