'use strict';

const { fetchLinkedinHtml } =
  require('../shared/fetch-linkedin-html');
const { buildSearchUrl } =
  require('./build-linkedin-job-search-url');
const { parseJobsFromHtml } =
  require('./parse-linkedin-jobs-from-html');

async function fetchSearchBatch({
  fetchHtml = fetchLinkedinHtml,
  rawOptions = {},
  startOffset = 0,
}) {
  const url =
    buildSearchUrl(rawOptions, startOffset);
  const html =
    await fetchHtml(url);

  return {
    html,
    jobs: parseJobsFromHtml(html),
    url,
  };
}

module.exports = {
  fetchSearchBatch,
};
