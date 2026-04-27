'use strict';

const { querySingleJob } =
  require('./linkedin-single-job-api');
const { parseCliArgs } =
  require('./parse-linkedin-single-job-cli-args');
const { printHelp } =
  require('./print-linkedin-single-job-help');

async function runLinkedinSingleJobCli(argv = process.argv) {
  const cliOptions =
    parseCliArgs(argv);

  if (cliOptions.help) {
    printHelp();
    return;
  }

  if (!cliOptions.jobUrl) {
    throw new Error('Missing LinkedIn job URL. Pass --jobUrl <url>.');
  }

  const result =
    await querySingleJob({
      jobUrl: cliOptions.jobUrl,
    });

  console.log(JSON.stringify(result, null, cliOptions.pretty ? 2 : 0));
}

module.exports = {
  runLinkedinSingleJobCli,
};
