'use strict';

const { parseCliArgumentValue } =
  require('../shared/parse-cli-argument-value');

function parseCliArgs(argv) {
  const args =
    argv.slice(2);
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const argument =
      args[index];

    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }

    if (argument === '--pretty' || argument === '--showUrl') {
      options[argument === '--pretty' ? 'pretty' : 'showUrl'] = true;
      continue;
    }

    const optionKey =
      getCliOptionKey(argument);

    if (!optionKey) {
      throw new Error(`Unknown argument: ${argument}`);
    }

    options[optionKey] =
      parseCliArgumentValue({ args, index });
    index += 1;
  }

  return options;
}

function getCliOptionKey(argument) {
  const keyMap = {
    '--date-since-posted': 'dateSincePosted',
    '--dateSincePosted': 'dateSincePosted',
    '--experience-level': 'experienceLevel',
    '--experienceLevel': 'experienceLevel',
    '--has-verification': 'has_verification',
    '--hasVerification': 'has_verification',
    '--job-type': 'jobType',
    '--jobType': 'jobType',
    '--keyword': 'keyword',
    '--limit': 'limit',
    '--location': 'location',
    '--max-entries': 'maxEntries',
    '--max-pages': 'maxPages',
    '--max-requests': 'maxRequests',
    '--max-results': 'maxResults',
    '--maxEntries': 'maxEntries',
    '--maxPages': 'maxPages',
    '--maxRequests': 'maxRequests',
    '--maxResults': 'maxResults',
    '--offset': 'start',
    '--page': 'start',
    '--remote-filter': 'remoteFilter',
    '--remoteFilter': 'remoteFilter',
    '--salary': 'salary',
    '--sort-by': 'sortBy',
    '--sortBy': 'sortBy',
    '--start': 'start',
    '--under-10-applicants': 'under_10_applicants',
    '--under10Applicants': 'under_10_applicants',
  };

  return keyMap[argument];
}

module.exports = {
  parseCliArgs,
};
