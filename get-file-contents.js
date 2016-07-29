'use strict';
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const config = require('config');

const REDMINE_ACTIVITIES = config.activities;

let accumulatedTimeByDateMap = {};
let lastDate = null;

const validateAndUpdateRow = (row, i) => {
  const index = i + 1;
  assert(isValidNumber(row.ticket), `Ticket must be a number. Error in row: ${index}`);
  assert(isValidNumber(row.hours), `Hours must be a number. Error in row: ${index}`);
  assert(!_.isEmpty(row.comment), `Comment must not be empty. Error in row: ${index}`);
  assert(_.includes(REDMINE_ACTIVITIES, row.activity), `Invalid Redmine Activity '${row.activity}' in row: ${index} | Value must be one of: ${REDMINE_ACTIVITIES}`);

  const inputDate = row.date || lastDate;
  row.date = getFullDate(inputDate, index);
  lastDate = row.date;
  validateAccumulatedValue(row.date, row.hours, index);

  return row;
};

const isValidNumber = num => !isNaN(num) && String(num) !== '0';


const SUNDAY = 0;
const SATURDAY = 6;
const A_DAY = 1000 * 60 * 60 * 24;
const THIRTY_DAYS = A_DAY * 30;

const getFullDate = (rawDate, index) => {
  const partialDateRegex = /^\d{2}-\d{2}$/;
  const fullDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const date = partialDateRegex.test(rawDate)
    ? new Date().getFullYear() + '-' + rawDate
    : rawDate;

  assert(fullDateRegex.test(date), `Invalid date '${date}' in row: ${index} | The date must be in the following format: YYYY-MM-DD`);
  assert(isValidDate(new Date(date)), `Invalid date '${date}' in row: ${index} | Invalid Date`);

  const dateNowInstance = new Date();
  dateNowInstance.setHours(0);
  dateNowInstance.setMinutes(0);
  dateNowInstance.setSeconds(0);

  const dateParts = date.match(fullDateRegex);
  const dateRowInstance = new Date(dateParts[1], Number(dateParts[2]) - 1, dateParts[3]);
  const dayOfTheWeek = dateRowInstance.getDay();

  assert(dateRowInstance <= dateNowInstance, `Invalid date ${date} in row: ${index} | The date must be today or in the past`);
  assert(dateNowInstance - dateRowInstance < THIRTY_DAYS, `Invalid date ${date} in row: ${index} | The date cannot be more than 30 days into the past`);
  assert(dayOfTheWeek !== SUNDAY && dayOfTheWeek !== SATURDAY, `Invalid date ${date} in row: ${index} | Cannot add a time entry on weekend`);

  return date;
};

const isValidDate = date =>
  Object.prototype.toString.call(date) === "[object Date]" && !isNaN(date.getTime());

const validateAccumulatedValue = (date, hours, index) => {
  if (!accumulatedTimeByDateMap[date]) {
    accumulatedTimeByDateMap[date] = 0;
  }

  accumulatedTimeByDateMap[date] += Number(hours);

  assert(accumulatedTimeByDateMap[date] <= 8, `Your total of hours for ${date} is greater than 8 in the row: ${index} | Current accumulated value is ${accumulatedTimeByDateMap[date]}`)
};

module.exports = () => {
  const rawContent = parse(fs.readFileSync(path.join(__dirname, './entries.csv')), {columns: true, trim: true, skip_empty_lines: true});

  // TODO encapsulate this
  accumulatedTimeByDateMap = {};
  lastDate = null;

  return _.map(rawContent, validateAndUpdateRow);
};