'use strict';

const {
  LINKEDIN_SEARCH_CONFIG,
} = require('../constants/linkedin-search-config');
const {
  DATE_SINCE_POSTED_MAP,
  EXPERIENCE_LEVEL_MAP,
  JOB_TYPE_MAP,
  REMOTE_FILTER_MAP,
  SALARY_MAP,
  SORT_BY_MAP,
} = require('../constants/linkedin-search-filter-maps');
const { normalizeText, toPositiveInteger } =
  require('../shared/normalize-option-values');
const { buildQueryOptions } =
  require('./build-linkedin-job-search-options');

function buildSearchUrl(rawOptions = {}, startOffset) {
  const options =
    buildQueryOptions(rawOptions);
  const effectiveStart =
    toPositiveInteger(startOffset, options.start);
  const params =
    new URLSearchParams();

  setOptionalQueryParameter({
    params,
    key: 'keywords',
    value: options.keyword,
  });
  setOptionalQueryParameter({
    params,
    key: 'location',
    value: options.location,
  });
  params.set('start', String(effectiveStart));
  setMappedQueryParameter({ params, key: 'f_TPR', map: DATE_SINCE_POSTED_MAP, value: options.dateSincePosted });
  setMappedQueryParameter({ params, key: 'f_JT', map: JOB_TYPE_MAP, value: options.jobType });
  setMappedQueryParameter({ params, key: 'f_WT', map: REMOTE_FILTER_MAP, value: options.remoteFilter });
  setMappedQueryParameter({ params, key: 'f_SB2', map: SALARY_MAP, value: options.salary });
  setMappedQueryParameter({ params, key: 'f_E', map: EXPERIENCE_LEVEL_MAP, value: options.experienceLevel });
  setMappedQueryParameter({ params, key: 'sortBy', map: SORT_BY_MAP, value: options.sortBy });
  setBooleanQueryParameter({ enabled: options.has_verification, key: 'f_VJ', params });
  setBooleanQueryParameter({ enabled: options.under_10_applicants, key: 'f_JIYN', params });

  return `${LINKEDIN_SEARCH_CONFIG.searchUrl}?${params.toString()}`;
}

function setBooleanQueryParameter({
  enabled,
  key,
  params,
}) {
  if (enabled) {
    params.set(key, 'true');
  }
}

function setMappedQueryParameter({
  key,
  map,
  params,
  value,
}) {
  const mappedValue =
    map[normalizeText(value)];

  if (mappedValue) {
    params.set(key, mappedValue);
  }
}

function setOptionalQueryParameter({
  key,
  params,
  value,
}) {
  if (value) {
    params.set(key, value);
  }
}

module.exports = {
  buildSearchUrl,
};
