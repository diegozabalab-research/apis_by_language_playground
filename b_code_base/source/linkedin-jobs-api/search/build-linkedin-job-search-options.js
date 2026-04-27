'use strict';

const {
  LINKEDIN_SEARCH_CONFIG,
} = require('../constants/linkedin-search-config');
const {
  normalizeBoolean,
  toPositiveInteger,
} = require('../shared/normalize-option-values');

function buildQueryOptions(rawOptions = {}) {
  const limit =
    Math.max(
      1,
      toPositiveInteger(
        rawOptions.limit,
        LINKEDIN_SEARCH_CONFIG.defaultLimit,
      ),
    );
  const start =
    toPositiveInteger(
      rawOptions.start ?? rawOptions.offset ?? rawOptions.page,
      0,
    );

  return {
    dateSincePosted: String(rawOptions.dateSincePosted ?? '').trim(),
    experienceLevel: String(rawOptions.experienceLevel ?? '').trim(),
    has_verification: normalizeBoolean(
      rawOptions.has_verification ?? rawOptions.hasVerification,
      false,
    ),
    jobType: String(rawOptions.jobType ?? '').trim(),
    keyword: String(rawOptions.keyword ?? '').trim(),
    limit,
    location: String(rawOptions.location ?? '').trim(),
    remoteFilter: String(rawOptions.remoteFilter ?? '').trim(),
    salary: String(rawOptions.salary ?? '').trim(),
    sortBy: String(rawOptions.sortBy ?? '').trim(),
    start,
    under_10_applicants: normalizeBoolean(
      rawOptions.under_10_applicants ?? rawOptions.under10Applicants,
      false,
    ),
  };
}

module.exports = {
  buildQueryOptions,
};
