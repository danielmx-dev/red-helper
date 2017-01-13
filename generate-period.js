'use strict';

const stringify = require('csv-stringify');
const _ = require('lodash');
const fs = require('fs');
const join = require('path').join;

const ONE_DAY = 26 * 60 * 60 * 1000;
const SUNDAY = 0;
const SATURDAY = 6;

const generateDays = (start, end) =>
  generateAllDaysForPeriod(start, end).filter(isValidDate);

const isValidDate = date => {
  const dayOfTheWeek = date.getDay();
  return dayOfTheWeek !== SUNDAY && dayOfTheWeek !== SATURDAY;
};

const generateAllDaysForPeriod = (start, end) => {
  const days = [];
  let currentDay = start;

  while (currentDay <= end) {
    console.log(currentDay, end);
    days.push(currentDay);
    currentDay = new Date(currentDay.getTime() + ONE_DAY);
    currentDay.setHours(0);
    currentDay.setMinutes(0);
    currentDay.setSeconds(0);
  }
  return days;
};

const getStartAndEndDate = (pivot) => pivot.getDate() <= 15
  ? {start: cloneInDate(pivot, 1), end: cloneInDate(pivot, 15)}
  : {start: cloneInDate(pivot, 16), end: lastOfTheMonth(pivot)};

const cloneInDate = (fullDate, dayOfTheMonth) => new Date(fullDate.getFullYear(), fullDate.getMonth(), dayOfTheMonth);
const lastOfTheMonth = (fullDate) => new Date(fullDate.getFullYear(), fullDate.getMonth() + 1, 0);
const formatDate = date => `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const pad = n => _.padStart(n, 2, '0');

const generateEntries = dates => _.flatMap(dates, date => {
  const baseEntry = {ticket: 6252, date: formatDate(date), comment: '', activity: 'Development'};

  return [hours(baseEntry, 4), hours(baseEntry, 2), hours(baseEntry, 2)]
});

const hours = (src, h) => Object.assign({hours: h}, src);


const period = getStartAndEndDate(new Date());
const validDates = generateDays(period.start, period.end);
const entries = generateEntries(validDates);

const stringifier = stringify({quotedEmpty: true, header: true});
const stream = stringifier
  .pipe(fs.createWriteStream(join(__dirname + '/entries.csv')));

entries.forEach(entry => stringifier.write(entry));

stringifier.end();
