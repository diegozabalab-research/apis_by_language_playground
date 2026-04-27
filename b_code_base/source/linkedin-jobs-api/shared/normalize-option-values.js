'use strict';

const {
  BOOLEAN_FALSE_VALUES,
  BOOLEAN_TRUE_VALUES,
} = require('../constants/boolean-value-sets');

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalizedValue =
    normalizeText(value);

  if (BOOLEAN_TRUE_VALUES.has(normalizedValue)) {
    return true;
  }

  if (BOOLEAN_FALSE_VALUES.has(normalizedValue)) {
    return false;
  }

  return fallback;
}

function toPositiveInteger(value, fallback) {
  const parsedValue =
    Number.parseInt(String(value ?? ''), 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return fallback;
  }

  return parsedValue;
}

module.exports = {
  normalizeBoolean,
  normalizeText,
  toPositiveInteger,
};
