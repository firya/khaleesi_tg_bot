import e from "express";

export const timeZoneOffset = 60 * 60 * 3;

export const parseDate = (strDate, UTC = false) => {
  var from, to;

  if (strDate.indexOf('-') !== -1) {
    var dateArray = strDate.split("-");
    from = dateToTimestamp(dateArray[0], UTC);
    to = dateToTimestamp(dateArray[1], UTC, true);
  } else {
    var dateArray = strDate.split(".");
    if (dateArray.length == 3) {
      from = dateToTimestamp(strDate, UTC);
      to = dateToTimestamp(strDate, UTC, true);
    } else if (dateArray.length == 2) {
      from = dateToTimestamp(`01.${strDate}`, UTC);
      var dateArray = strDate.split(".");
      var month = dateArray[0];
      var year = dateArray[1];
      var toDate = new Date(year, month, 0);
      to = dateToTimestamp(`${leftPad(toDate.getDate(), 2)}.${leftPad(toDate.getMonth() + 1, 2)}.${toDate.getFullYear()}`, UTC, true);
    }
  }

  return {
    from: from,
    to: to
  };
}

export const dateForRoistat = (date) => {
  date = date || new Date();

  return `${date.getFullYear()}-${leftPad(date.getMonth() + 1, 2)}-${leftPad(date.getDate(), 2)}T${leftPad(date.getHours(), 2)}:${leftPad(date.getMinutes(), 2)}:${leftPad(date.getSeconds(), 2)}+0000`;
}

export const dateToTimestamp = (strDate, UTC = false, to = false) => {
  let dateArray = strDate.split(".");

  let date = (to) ? `${dateArray[1]}/${dateArray[0]}/${dateArray[2]} 23:59:59` : `${dateArray[1]}/${dateArray[0]}/${dateArray[2]} 00:00:00`;

  var result = (!UTC) ? (Date.parse(date) - timeZoneOffset * 1000) / 1000 : (Date.parse(date)) / 1000

  return result;
}

export const timestampToDate = (timestamp, UTC = false, time = false) => {
  timestamp = (!UTC) ? (timestamp + timeZoneOffset) * 1000 : timestamp * 1000;
  var date = new Date(timestamp);

  var day = leftPad(date.getDate(), 2);
  var month = leftPad(date.getMonth() + 1, 2);
  var year = date.getFullYear();

  var result = `${day}.${month}.${year}`;

  if (time) {
    var hours = leftPad(date.getHours(), 2);
    var minutes = leftPad(date.getMinutes(), 2);
    var seconds = leftPad(date.getSeconds(), 2);
    result += ` ${hours}:${minutes}:${seconds}`;
  }

  return result;
}

export const clearPhone = (str) => {
  var result = str.replace(/[^\d]/g, '');
  if (result.length == 11) {
    result = `7${result.substring(1)}`;
  } else if (result.length == 10) {
    result = `7${result}`;
  }
  return result;
}

export const formatPhone = (str) => {
  var phone = clearPhone(str);

  if (phone.length != 11) {
    return str;
  } else {
    return phone.replace(/([0-9]{1})([0-9]{3})([0-9]{3})([0-9]{2})([0-9]{2})/, "+7$2$3$4$5");
  }

  return phone;
}

export const leftPad = (str, len, pad = '0') => {
  str = str.toString();
  while (str.length < len) str = pad + str;
  return str;
}

export const listToMatrix = (list, elementsPerSubArray = 3) => {
  var matrix = [], i, k;

  for (i = 0, k = -1; i < list.length; i++) {
    if (i % elementsPerSubArray === 0) {
      k++;
      matrix[k] = [];
    }

    matrix[k].push(list[i]);
  }

  return matrix;
}

export const getInfoAboutDay = (timestamp, UTC) => {
  timestamp = (!UTC) ? (timestamp + timeZoneOffset) * 1000 : timestamp * 1000;

  var markList = ['🔴', '🔵', '🔵', '🔵', '🔵', '🔵', '🔴'];
  var dowList = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  var date = new Date(timestamp);
  var dow = date.getDay();
  var day = leftPad(date.getDate(), 2);
  var month = leftPad(date.getMonth() + 1, 2);
  var year = date.getFullYear();
  var hours = leftPad(date.getHours(), 2);
  var minutes = leftPad(date.getMinutes(), 2);
  var seconds = leftPad(date.getSeconds(), 2);

  return {
    fullDate: date,
    dow: dowList[dow],
    mark: markList[dow],
    date: `${day}.${month}.${year}`,
    datetime: `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`,
    time: `${hours}:${minutes}:${seconds}`
  };
}

export const dateIntervalToUserView = (interval, prefix = 'Отчет за', mark = true, UTC = false) => {
  var from = getInfoAboutDay(interval.from, UTC);
  var to = getInfoAboutDay(interval.to, UTC);

  if (from.date == to.date) {
    return (mark) ? `${prefix} ${from.date}, ${from.dow} ${from.mark}` : `${prefix} ${from.date}, ${from.dow}`;
  } else {
    return `${prefix} интервал дат ${from.date} — ${to.date} включительно`;
  }
}

export const calcPercent = (value, total) => {
  return (total != 0) ? Math.round((value / total) * 10000) / 100 : '-';
}

export const priceFormat = (value) => {
  if (value) {
    value = value.toFixed(0);
    return (value == Infinity) ? `-` : value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + "₽";
  } else {
    return `0₽`;
  }
}

export const findDateAlias = (date) => {
  var today = new Date();
  var yesterday = new Date(new Date().setDate(today.getDate() - 1));
  var month = new Date();
  var prevmonth = new Date(new Date().setMonth(month.getMonth() - 1));

  const aliasList = {
    today: `${leftPad(today.getDate(), 2)}.${leftPad(today.getMonth() + 1, 2)}.${today.getFullYear()}`,
    yesterday: `${leftPad(yesterday.getDate(), 2)}.${leftPad(yesterday.getMonth() + 1, 2)}.${yesterday.getFullYear()}`,
    month: `${leftPad(month.getMonth() + 1, 2)}.${month.getFullYear()}`,
    prevmonth: `${leftPad(prevmonth.getMonth() + 1, 2)}.${prevmonth.getFullYear()}`
  };

  return aliasList[date] ? aliasList[date] : date;
}

export const joinReplayByMaxLength = (replayArray, maxLength = 4096) => {
  var result = [];

  replayArray.map(replay => {
    if (!result.length || result[result.length - 1].length + replay.length > maxLength - 4) {
      result.push('');
    } else if (result[result.length - 1].length) {
      result[result.length - 1] += '\n\n';
    }
    result[result.length - 1] += replay;
  });

  return result;
}

export const checkIsHasValidDomain = (domain) => {
  if (!domain) {
    return null;
  }
  var re = new RegExp(/([\w\-]+)\.([\w]+)/);
  var result = domain.match(re);
  if (!result) {
    return null;
  } else {
    return result[0];
  }
}

export const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}