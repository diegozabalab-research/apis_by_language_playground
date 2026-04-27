'use strict';

const { buildQueryOptions, buildSearchUrl, query } =
  require('./linkedin-jobs-search-api');
const { parseCliArgs } =
  require('./parse-linkedin-jobs-search-cli-args');
const { printHelp } =
  require('./print-linkedin-jobs-search-help');

async function runLinkedinJobsSearchCli(argv = process.argv) {
  const cliOptions =
    parseCliArgs(argv);

  if (cliOptions.help) {
    printHelp();
    return;
  }

  const runtimeOptions =
    buildQueryOptions({
      dateSincePosted: cliOptions.dateSincePosted,
      experienceLevel: cliOptions.experienceLevel,
      has_verification: cliOptions.has_verification,
      jobType: cliOptions.jobType,
      keyword: cliOptions.keyword || '',
      limit: cliOptions.limit,
      location: cliOptions.location || 'Australia',
      remoteFilter: cliOptions.remoteFilter,
      salary: cliOptions.salary,
      sortBy: cliOptions.sortBy,
      start: cliOptions.start,
      under_10_applicants: cliOptions.under_10_applicants,
    });

  if (cliOptions.showUrl) {
    console.error(`Search URL: ${buildSearchUrl(runtimeOptions, runtimeOptions.start)}`);
  }

  const jobs =
    await query(runtimeOptions);

  console.log(JSON.stringify(jobs, null, cliOptions.pretty ? 2 : 0));
}

module.exports = {
  runLinkedinJobsSearchCli,
};
