'use strict';

const { fetchLinkedinHtml } =
  require('../shared/fetch-linkedin-html');
const {
  buildQueriedJobUrl,
  extractJobIdFromUrl,
} = require('./build-queried-linkedin-job-url');
const {
  isStillActiveFromHtml,
  parseApplyClicksFromHtml,
  parseJobPostingHtml,
} = require('./parse-linkedin-single-job-html');

async function querySingleJob({
  fetchHtml = fetchLinkedinHtml,
  jobUrl,
}) {
  const queriedUrl =
    buildQueriedJobUrl(jobUrl);
  const html =
    await fetchHtml(queriedUrl);

  return parseJobPostingHtml({
    givenUrl: jobUrl,
    html,
    queriedUrl,
  });
}

module.exports = {
  buildQueriedJobUrl,
  extractJobIdFromUrl,
  isStillActiveFromHtml,
  parseApplyClicksFromHtml,
  parseJobPostingHtml,
  querySingleJob,
};
