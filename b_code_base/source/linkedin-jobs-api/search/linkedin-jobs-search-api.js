'use strict';

const {
  LINKEDIN_SEARCH_CONFIG,
} = require('../constants/linkedin-search-config');
const { buildQueryOptions } =
  require('./build-linkedin-job-search-options');
const { buildSearchUrl } =
  require('./build-linkedin-job-search-url');
const {
  enrichJobWithDescription,
} = require('./enrich-linkedin-job-with-description');
const { fetchSearchBatch } =
  require('./fetch-linkedin-job-search-batch');
const { parseJobsFromHtml } =
  require('./parse-linkedin-jobs-from-html');

async function query(rawOptions = {}) {
  const options =
    buildQueryOptions(rawOptions);
  const jobs =
    await collectSearchJobs({
      fetchHtml: rawOptions.fetchHtml,
      options,
    });
  const trimmedJobs =
    jobs.slice(0, options.limit);

  return Promise.all(
    trimmedJobs.map((job) =>
      enrichJobWithDescription({
        fetchHtml: rawOptions.fetchHtml,
        job,
      })),
  );
}

async function collectSearchJobs({
  fetchHtml,
  options,
}) {
  const jobs = [];
  const seenUrls =
    new Set();
  let nextStart =
    options.start;

  while (jobs.length < options.limit) {
    const batchResult =
      await fetchSearchBatch({
        fetchHtml,
        rawOptions: options,
        startOffset: nextStart,
      });

    if (batchResult.jobs.length === 0) {
      break;
    }

    pushUniqueJobs({ jobs, seenUrls, sourceJobs: batchResult.jobs });

    if (batchResult.jobs.length < LINKEDIN_SEARCH_CONFIG.searchBatchSize) {
      break;
    }

    nextStart += LINKEDIN_SEARCH_CONFIG.searchBatchSize;
  }

  return jobs;
}

function pushUniqueJobs({
  jobs,
  seenUrls,
  sourceJobs,
}) {
  for (const job of sourceJobs) {
    if (seenUrls.has(job.jobUrl)) {
      continue;
    }

    seenUrls.add(job.jobUrl);
    jobs.push(job);
  }
}

module.exports = {
  buildQueryOptions,
  buildSearchUrl,
  parseJobsFromHtml,
  query,
};
