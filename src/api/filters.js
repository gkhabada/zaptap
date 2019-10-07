function twoDigits(num) {
  const str = String(num);
  if (str.length > 2) return str.slice(-2);
  if (str.length < 2) return 0 + str;
  return str
}

export const todate = function(time, modifier) {
  const date = new Date(time);
  if (!date) return 'Нет данных';
  const ms = date.getTime();
  if (isNaN(ms)) return 'Нет данных';

  let year = twoDigits(date.getFullYear());
  let month = twoDigits(date.getMonth() + 1);
  let day = twoDigits(date.getDate());

  if(modifier === 'twoDigitYear') {
    year = year.toString().substr(-2);
  }

  return `${day}.${month}.${year}`;
};
