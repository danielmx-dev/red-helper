'use strict';
const config = require('config');
const getFileContents = require('../get-file-contents');

const timeEntries = getFileContents();

this['before'] = function(browser) {
  browser
    .url(`${config.redmineBase}/login`)
    .waitForElementVisible('input#username', 1000)
    .setValue('input#username', config.username)
    .setValue('input#password', config.password)
    .click('input[type=submit]')
    .assert.containsText('#content h2', 'My page');
};

const DATE_INPUT = '#time_entry_spent_on';
const HOURS_INPUT = '#time_entry_hours';
const COMMENTS_INPUT = '#time_entry_comments';
const ACTIVITY_INPUT = '#time_entry_activity_id';
const CONTINUE_BUTTON = 'input[name=continue]';
const NOTICE_ELEMENT = '#flash_notice';

timeEntries.forEach(entry => {
  this[`Time Entry => ${entry.date} / ${entry.comment}`] = function(browser) {
    browser
      .url(`${config.redmineBase}/issues/${entry.ticket}/time_entries/new`)
      .waitForElementVisible(DATE_INPUT, 1000)
      .clearValue(DATE_INPUT)
      .setValue(DATE_INPUT, entry.date)
      .setValue(HOURS_INPUT, entry.hours)
      .setValue(COMMENTS_INPUT, entry.comment)
      .setValue(ACTIVITY_INPUT, entry.activity)
      .click(CONTINUE_BUTTON)
      .waitForElementVisible(NOTICE_ELEMENT, 5000);
  };
});


this['Close'] = function(browser) {
  browser.end();
};
