'use strict';

const DATE_SINCE_POSTED_MAP = Object.freeze({
  '1hr': 'r3600',
  '24hr': 'r86400',
  'past month': 'r2592000',
  'past week': 'r604800',
});

const EXPERIENCE_LEVEL_MAP = Object.freeze({
  associate: '3',
  director: '5',
  'entry level': '2',
  executive: '6',
  internship: '1',
  senior: '4',
});

const JOB_TYPE_MAP = Object.freeze({
  contract: 'C',
  internship: 'I',
  other: 'O',
  'part time': 'P',
  'full time': 'F',
  temporary: 'T',
  volunteer: 'V',
});

const REMOTE_FILTER_MAP = Object.freeze({
  hybrid: '3',
  'on site': '1',
  remote: '2',
});

const SALARY_MAP = Object.freeze({
  '100000': '4',
  '120000': '5',
  '40000': '1',
  '60000': '2',
  '80000': '3',
});

const SORT_BY_MAP = Object.freeze({
  recent: 'DD',
  relevant: 'R',
});

module.exports = {
  DATE_SINCE_POSTED_MAP,
  EXPERIENCE_LEVEL_MAP,
  JOB_TYPE_MAP,
  REMOTE_FILTER_MAP,
  SALARY_MAP,
  SORT_BY_MAP,
};
