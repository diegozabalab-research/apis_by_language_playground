#!/usr/bin/env node

'use strict';

const {
  buildQueryOptions,
  buildSearchUrl,
  query,
} = require('./linkedin_jobs_api_test');

const SINGLE_ENTRY_LIMIT = 1;
const MAX_ENTRY_COUNT = 999;
const REQUESTS_PER_SLEEP = 10;
const SLEEP_TIME_MS = 5000;
const BOOLEAN_TRUE_VALUES = new Set(['1', 'true', 'yes', 'y', 'on']);
const BOOLEAN_FALSE_VALUES = new Set(['0', 'false', 'no', 'n', 'off']);

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalized = normalizeText(value);
  if (BOOLEAN_TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (BOOLEAN_FALSE_VALUES.has(normalized)) {
    return false;
  }

  return fallback;
}

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

function parseArgValue(args, index) {
  if (index + 1 >= args.length) {
    throw new Error(`Missing value for ${args[index]}`);
  }

  return args[index + 1];
}

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function parseCliArgs(argv) {
  const args = argv.slice(2);
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }

    if (argument === '--pretty') {
      options.pretty = true;
      continue;
    }

    if (argument === '--showUrl') {
      options.showUrl = true;
      continue;
    }

    const keyMap = {
      '--keyword': 'keyword',
      '--location': 'location',
      '--dateSincePosted': 'dateSincePosted',
      '--date-since-posted': 'dateSincePosted',
      '--jobType': 'jobType',
      '--job-type': 'jobType',
      '--remoteFilter': 'remoteFilter',
      '--remote-filter': 'remoteFilter',
      '--salary': 'salary',
      '--experienceLevel': 'experienceLevel',
      '--experience-level': 'experienceLevel',
      '--limit': 'limit',
      '--start': 'start',
      '--offset': 'start',
      '--page': 'start',
      '--sortBy': 'sortBy',
      '--sort-by': 'sortBy',
      '--hasVerification': 'has_verification',
      '--has-verification': 'has_verification',
      '--under10Applicants': 'under_10_applicants',
      '--under-10-applicants': 'under_10_applicants',
      '--maxEntries': 'maxEntries',
      '--max-entries': 'maxEntries',
      '--maxRequests': 'maxRequests',
      '--max-requests': 'maxRequests',
      '--maxResults': 'maxEntries',
      '--max-results': 'maxEntries',
      '--maxPages': 'maxRequests',
      '--max-pages': 'maxRequests',
    };

    const optionKey = keyMap[argument];
    if (!optionKey) {
      throw new Error(`Unknown argument: ${argument}`);
    }

    options[optionKey] = parseArgValue(args, index);
    index += 1;
  }

  return options;
}

function buildWrapperOptions(rawOptions = {}) {
  const baseOptions = buildQueryOptions(rawOptions);
  return {
    ...baseOptions,
    start: 0,
    maxEntries:
      rawOptions.maxEntries === undefined &&
      rawOptions.maxResults === undefined &&
      rawOptions.maxRequests === undefined &&
      rawOptions.maxPages === undefined
        ? null
        : Math.min(
            MAX_ENTRY_COUNT,
            Math.max(
              1,
              toPositiveInteger(
                rawOptions.maxEntries ??
                  rawOptions.maxResults ??
                  rawOptions.maxRequests ??
                  rawOptions.maxPages,
                MAX_ENTRY_COUNT
              )
            )
          ),
    pretty: normalizeBoolean(rawOptions.pretty, false),
    showUrl: normalizeBoolean(rawOptions.showUrl, false),
  };
}

async function queryAll(rawOptions = {}) {
  const options = buildWrapperOptions(rawOptions);
  const maxEntries = options.maxEntries ?? MAX_ENTRY_COUNT;
  const allJobs = [];
  let nextStart = 0;
  let requestCount = 0;

  while (allJobs.length < maxEntries && nextStart < MAX_ENTRY_COUNT) {
    const jobs = await query({
      ...options,
      start: nextStart,
      limit: SINGLE_ENTRY_LIMIT,
    });
    requestCount += 1;
    const firstJob = jobs[0];

    if (!firstJob) {
      break;
    }

    allJobs.push(firstJob);
    nextStart += 1;

    if (requestCount % REQUESTS_PER_SLEEP === 0) {
      await sleep(SLEEP_TIME_MS);
    }
  }

  return allJobs;
}

function printHelp() {
  console.log(`Usage:
  ./linkedin_jobs_api_all_pages.js [options]

Options:
  --keyword <text>              Search keyword, e.g. "software engineer"
  --location <text>             Search location, e.g. "Australia"
  --dateSincePosted <value>     1hr, 24hr, past week, past month
  --jobType <value>             full time, part time, contract, temporary, volunteer, internship
  --remoteFilter <value>        on site, remote, hybrid
  --salary <value>              40000, 60000, 80000, 100000, 120000
  --experienceLevel <value>     internship, entry level, associate, senior, director, executive
  --start <number>              Accepted for compatibility and ignored
  --offset <number>             Accepted for compatibility and ignored
  --page <number>               Accepted for compatibility and ignored
  --sortBy <value>              recent or relevant
  --hasVerification <boolean>   true or false
  --under10Applicants <boolean> true or false
  --maxEntries <number>         Optional cap on collected entries, max 999
  --maxResults <number>         Alias for --maxEntries
  --maxRequests <number>        Deprecated alias for --maxEntries
  --maxPages <number>           Deprecated alias for --maxEntries
  --limit <number>              Accepted for compatibility and ignored by all-pages mode
  --pretty                      Pretty-print JSON output
  --showUrl                     Print the first generated search URL before requests
  --help                        Show this help

Notes:
  This wrapper always begins at start position 0. It calls
  linkedin_jobs_api_test.js with limit 1, keeps the first returned job,
  discards the rest, increments start by 1, and repeats until no job is
  returned or 999 entries have been collected. It also waits 5 seconds after
  every 10 requests to reduce rate limiting. The --limit and --start flags are
  accepted for compatibility, but ignored by all-pages mode.

Examples:
  ./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js --keyword "data engineer" --location "Australia"
  ./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js --keyword "data" --maxEntries 5
  ./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js --keyword "data" --sortBy recent --dateSincePosted "24hr" --maxEntries 100
`);
}

async function main() {
  const cliOptions = parseCliArgs(process.argv);

  if (cliOptions.help) {
    printHelp();
    return;
  }

  const runtimeOptions = buildWrapperOptions({
    keyword: cliOptions.keyword || '',
    location: cliOptions.location || 'Australia',
    dateSincePosted: cliOptions.dateSincePosted,
    jobType: cliOptions.jobType,
    remoteFilter: cliOptions.remoteFilter,
    salary: cliOptions.salary,
    experienceLevel: cliOptions.experienceLevel,
    limit: cliOptions.limit,
    start: cliOptions.start,
    sortBy: cliOptions.sortBy,
    has_verification: cliOptions.has_verification,
    under_10_applicants: cliOptions.under_10_applicants,
    maxEntries: cliOptions.maxEntries,
    maxResults: cliOptions.maxResults,
    maxRequests: cliOptions.maxRequests,
    maxPages: cliOptions.maxPages,
    pretty: cliOptions.pretty,
    showUrl: cliOptions.showUrl,
  });

  if (runtimeOptions.showUrl) {
    console.error(
      `First batch URL: ${buildSearchUrl(
        runtimeOptions,
        0
      )}`
    );
  }

  const jobs = await queryAll(runtimeOptions);
  const spacing = runtimeOptions.pretty ? 2 : 0;
  console.log(JSON.stringify(jobs, null, spacing));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  buildWrapperOptions,
  queryAll,
};
