'use strict';

const {
  LINKEDIN_ALL_PAGES_CONFIG,
} = require('../constants/linkedin-all-pages-config');
const { buildWrapperOptions } =
  require('./build-linkedin-all-pages-options');
const { sleepForMilliseconds } =
  require('./sleep-for-milliseconds');
const { query } =
  require('../search/linkedin-jobs-search-api');

async function queryAll(rawOptions = {}) {
  const options =
    buildWrapperOptions(rawOptions);
  const queryImpl =
    rawOptions.queryImpl ?? query;
  const jobs = [];
  let requestCount = 0;
  let nextStart = 0;

  while (jobs.length < getMaxEntries(options)) {
    const sourceJobs =
      await queryImpl({
        ...options,
        limit: LINKEDIN_ALL_PAGES_CONFIG.singleEntryLimit,
        start: nextStart,
      });
    const firstJob =
      sourceJobs[0];

    requestCount += 1;

    if (!firstJob) {
      break;
    }

    jobs.push(firstJob);
    nextStart += 1;

    if (shouldSleep({ nextStart, requestCount })) {
      await (rawOptions.sleep ?? sleepForMilliseconds)(
        LINKEDIN_ALL_PAGES_CONFIG.sleepTimeMs,
      );
    }
  }

  return jobs;
}

function getMaxEntries(options) {
  return options.maxEntries ?? LINKEDIN_ALL_PAGES_CONFIG.maxEntryCount;
}

function shouldSleep({
  nextStart,
  requestCount,
}) {
  return (
    nextStart < LINKEDIN_ALL_PAGES_CONFIG.maxEntryCount &&
    requestCount % LINKEDIN_ALL_PAGES_CONFIG.requestsPerSleep === 0
  );
}

module.exports = {
  buildWrapperOptions,
  queryAll,
};
