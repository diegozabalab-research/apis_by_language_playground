'use strict';

const {
  LINKEDIN_ALL_PAGES_CONFIG,
} = require('../constants/linkedin-all-pages-config');
const { normalizeBoolean, toPositiveInteger } =
  require('../shared/normalize-option-values');
const { buildQueryOptions } =
  require('../search/build-linkedin-job-search-options');

function buildWrapperOptions(rawOptions = {}) {
  const maxEntries =
    getMaxEntries(rawOptions);

  return {
    ...buildQueryOptions(rawOptions),
    maxEntries,
    pretty: normalizeBoolean(rawOptions.pretty, false),
    showUrl: normalizeBoolean(rawOptions.showUrl, false),
    start: 0,
  };
}

function getMaxEntries(rawOptions) {
  const maxEntryValue =
    rawOptions.maxEntries ??
    rawOptions.maxResults ??
    rawOptions.maxRequests ??
    rawOptions.maxPages;

  if (maxEntryValue === undefined) {
    return null;
  }

  return Math.min(
    LINKEDIN_ALL_PAGES_CONFIG.maxEntryCount,
    Math.max(
      1,
      toPositiveInteger(
        maxEntryValue,
        LINKEDIN_ALL_PAGES_CONFIG.maxEntryCount,
      ),
    ),
  );
}

module.exports = {
  buildWrapperOptions,
};
