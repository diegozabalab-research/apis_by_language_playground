'use strict';

const BOOLEAN_TRUE_VALUES =
  new Set(['1', 'true', 'yes', 'y', 'on']);

const BOOLEAN_FALSE_VALUES =
  new Set(['0', 'false', 'no', 'n', 'off']);

module.exports = {
  BOOLEAN_FALSE_VALUES,
  BOOLEAN_TRUE_VALUES,
};
