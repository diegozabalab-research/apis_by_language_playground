#!/usr/bin/env node

'use strict';

const {
  buildQueryOptions,
  buildSearchUrl,
  query,
} = require('./linkedin_jobs_api_test');

const LINKEDIN_BATCH_SIZE = 25;
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
      '--maxPages': 'maxPages',
      '--max-pages': 'maxPages',
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
    start: toPositiveInteger(
      rawOptions.start ?? rawOptions.offset ?? rawOptions.page,
      baseOptions.start
    ),
    maxPages:
      rawOptions.maxPages === undefined
        ? null
        : Math.max(1, toPositiveInteger(rawOptions.maxPages, 1)),
    pretty: normalizeBoolean(rawOptions.pretty, false),
    showUrl: normalizeBoolean(rawOptions.showUrl, false),
  };
}

async function queryAll(rawOptions = {}) {
  const options = buildWrapperOptions(rawOptions);
  const startingPosition = options.start;
  const maxPages = options.maxPages;
  const allJobs = [];
  const seenUrls = new Set();
  let nextStart = startingPosition;
  let fetchedBatchCount = 0;

  while (maxPages === null || fetchedBatchCount < maxPages) {
    const batchJobs = await query({
      ...options,
      start: nextStart,
      limit: LINKEDIN_BATCH_SIZE,
    });

    if (batchJobs.length === 0) {
      break;
    }

    let newJobsInBatch = 0;
    for (const job of batchJobs) {
      if (!job || !job.jobUrl || seenUrls.has(job.jobUrl)) {
        continue;
      }

      seenUrls.add(job.jobUrl);
      allJobs.push(job);
      newJobsInBatch += 1;
    }

    fetchedBatchCount += 1;

    if (batchJobs.length < LINKEDIN_BATCH_SIZE || newJobsInBatch === 0) {
      break;
    }

    nextStart += LINKEDIN_BATCH_SIZE;
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
  --start <number>              Zero-based starting job position, default 0
  --offset <number>             Alias for --start
  --page <number>               Deprecated alias for --start
  --sortBy <value>              recent or relevant
  --hasVerification <boolean>   true or false
  --under10Applicants <boolean> true or false
  --maxPages <number>           Optional safety cap on pages fetched
  --limit <number>              Accepted for compatibility and ignored by all-pages mode
  --pretty                      Pretty-print JSON output
  --showUrl                     Print the first generated search URL before requests
  --help                        Show this help

Notes:
  This wrapper fetches every available LinkedIn batch by repeatedly calling
  linkedin_jobs_api_test.js with a fixed page size of 25. The --limit flag is
  accepted for compatibility, but all-pages mode ignores it so iteration stays
  aligned with LinkedIn's guest endpoint batch size.

Examples:
  ./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js --keyword "data engineer" --location "Australia" --pretty
  ./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js --keyword "data" --start 0 --maxPages 5 --pretty
  ./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js --keyword "product manager" --remoteFilter remote --sortBy recent --start 50 --maxPages 5 --pretty
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
    maxPages: cliOptions.maxPages,
    pretty: cliOptions.pretty,
    showUrl: cliOptions.showUrl,
  });

  if (runtimeOptions.showUrl) {
    console.error(
      `First batch URL: ${buildSearchUrl(
        runtimeOptions,
        runtimeOptions.start
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
