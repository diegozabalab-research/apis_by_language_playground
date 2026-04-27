'use strict';

const { buildSearchUrl } =
  require('../search/linkedin-jobs-search-api');
const { buildWrapperOptions, queryAll } =
  require('./linkedin-jobs-all-pages-api');
const { parseCliArgs } =
  require('./parse-linkedin-jobs-all-pages-cli-args');
const { printHelp } =
  require('./print-linkedin-jobs-all-pages-help');

async function runLinkedinJobsAllPagesCli(argv = process.argv) {
  const cliOptions =
    parseCliArgs(argv);

  if (cliOptions.help) {
    printHelp();
    return;
  }

  const runtimeOptions =
    buildWrapperOptions({
      dateSincePosted: cliOptions.dateSincePosted,
      experienceLevel: cliOptions.experienceLevel,
      has_verification: cliOptions.has_verification,
      jobType: cliOptions.jobType,
      keyword: cliOptions.keyword || '',
      limit: cliOptions.limit,
      location: cliOptions.location || 'Australia',
      maxEntries: cliOptions.maxEntries,
      maxPages: cliOptions.maxPages,
      maxRequests: cliOptions.maxRequests,
      maxResults: cliOptions.maxResults,
      pretty: cliOptions.pretty,
      remoteFilter: cliOptions.remoteFilter,
      salary: cliOptions.salary,
      showUrl: cliOptions.showUrl,
      sortBy: cliOptions.sortBy,
      start: cliOptions.start,
      under_10_applicants: cliOptions.under_10_applicants,
    });

  if (runtimeOptions.showUrl) {
    console.error(`First batch URL: ${buildSearchUrl(runtimeOptions, 0)}`);
  }

  const jobs =
    await queryAll(runtimeOptions);

  console.log(JSON.stringify(jobs, null, runtimeOptions.pretty ? 2 : 0));
}

module.exports = {
  runLinkedinJobsAllPagesCli,
};
