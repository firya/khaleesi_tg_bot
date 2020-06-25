import { leftPad, listToMatrix } from '../utils.js';

export const inlineMonthCalendarKeyboard = (props = {}) => {
  return listToMatrix(generateMonthCalendar(props), 3);
}

export const inlineDayKeyboard = (props = {}) => {
  return listToMatrix(generateFewDays(props), 3);
}

export const inlineFastIntervalSelect = (props = {}) => {
  var result = generateFewDays({ ...props, count: 3 });
  result = result.concat(generateMonthCalendar({ ...props, count: 3 }));

  return listToMatrix(result, 3);
}

export const inlineTimeKeyboard = (props = {}) => {
  return listToMatrix(generateTimeBlock({ ...props, from: 8, to: 24 }), 4);
}

export const defaultKeyboard = (admin = false) => {
  if (admin) {
    return [
      [
        '📱 Созданные',
      ], [
        '📏 Назначенные',
      ], [
        '🚪 Закрытые',
      ], [
        '⏱ Добавить отчет',
        '❌ Удалить отчет',
      ], [
        '🙎‍♂️ Add User',
        '💀 Remove User'
      ], [
        '/help',
      ]
    ];
  } else {
    return [
      [
        '📱 Созданные',
      ], [
        '📏 Назначенные',
      ], [
        '🚪 Закрытые',
      ], [
        '⏱ Добавить отчет',
        '❌ Удалить отчет',
      ], [
        '/help'
      ]
    ];
  }
}

const generateMonthCalendar = (props = {}) => {
  props.count = props.count || 12;
  const monthList = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  var result = [];

  var d = new Date();
  for (let i = 0; i < props.count; i++) {
    const month = d.getMonth();
    const year = d.getFullYear();

    result.push({
      text: `${monthList[month]} ${year}`,
      callback_data: `${props.callback_data} ${leftPad(month + 1, 2)}.${year}`
    })

    d.setMonth(d.getMonth() - 1);
  }

  return result;
}

const generateFewDays = (props = {}) => {
  props.count = props.count || 3;
  var result = [];

  var textList = ['Сегодня', 'Вчера', 'Позавчера'];

  var d = new Date();
  for (let i = 0; i < props.count; i++) {
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();

    result.push({
      text: (textList[i]) ? `${textList[i]}` : `${leftPad(day, 2)}.${leftPad(month + 1, 2)}.${year}`,
      callback_data: `${props.callback_data} ${leftPad(day, 2)}.${leftPad(month + 1, 2)}.${year}`
    });
    d.setDate(d.getDate() - 1);
  }

  return result;
}

const generateTimeBlock = (props = {}) => {
  props.from = props.from || 0;
  props.to = props.to || 24;

  var result = [];

  for (let i = props.from; i < props.to; i++) {
    result.push({
      text: `${leftPad(i)}:00:00`,
      callback_data: `${props.callback_data} ${leftPad(i - 3)}:00:00`
    });
  }

  return result;
}