#!/usr/bin/env node

'use strict';

const SEARCH_URL =
  'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
const LINKEDIN_BATCH_SIZE = 25;
const DEFAULT_LIMIT = 20;

const DATE_SINCE_POSTED_MAP = {
  '1hr': 'r3600',
  '24hr': 'r86400',
  'past week': 'r604800',
  'past month': 'r2592000',
};

const JOB_TYPE_MAP = {
  'full time': 'F',
  'part time': 'P',
  contract: 'C',
  temporary: 'T',
  volunteer: 'V',
  internship: 'I',
  other: 'O',
};

const REMOTE_FILTER_MAP = {
  'on site': '1',
  remote: '2',
  hybrid: '3',
};

const SALARY_MAP = {
  '40000': '1',
  '60000': '2',
  '80000': '3',
  '100000': '4',
  '120000': '5',
};

const EXPERIENCE_LEVEL_MAP = {
  internship: '1',
  'entry level': '2',
  associate: '3',
  senior: '4',
  director: '5',
  executive: '6',
};

const SORT_BY_MAP = {
  recent: 'DD',
  relevant: 'R',
};

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

function decodeHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x2F;/gi, '/')
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16))
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function getRequestHeaders() {
  return {
    accept: 'text/html,application/xhtml+xml',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'no-cache',
    pragma: 'no-cache',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  };
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: getRequestHeaders(),
  });

  if (!response.ok) {
    throw new Error(
      `LinkedIn request failed with ${response.status} ${response.statusText}`
    );
  }

  return response.text();
}

function extractAttribute(block, attributeName) {
  const doubleQuotePattern = new RegExp(`${attributeName}="([^"]+)"`, 'i');
  const singleQuotePattern = new RegExp(`${attributeName}='([^']+)'`, 'i');
  const doubleQuoteMatch = block.match(doubleQuotePattern);
  if (doubleQuoteMatch) {
    return decodeHtml(doubleQuoteMatch[1]);
  }

  const singleQuoteMatch = block.match(singleQuotePattern);
  return singleQuoteMatch ? decodeHtml(singleQuoteMatch[1]) : '';
}

function getClassAttribute(block) {
  return normalizeText(extractAttribute(block, 'class'));
}

function hasAllClassFragments(block, classFragments) {
  const classTokens = getClassAttribute(block)
    .split(/\s+/)
    .filter(Boolean);

  return classFragments.every((fragment) =>
    classTokens.includes(normalizeText(fragment))
  );
}

function findTagEnd(html, startIndex) {
  let inSingleQuote = false;
  let inDoubleQuote = false;

  for (let index = startIndex; index < html.length; index += 1) {
    const character = html[index];
    if (character === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (character === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (character === '>' && !inSingleQuote && !inDoubleQuote) {
      return index;
    }
  }

  return -1;
}

function extractBalancedElementAt(html, startIndex, tagName) {
  const lowerTagName = String(tagName ?? '').toLowerCase();
  const tagPattern = new RegExp(`<(/?)${lowerTagName}\\b[^>]*>`, 'gi');
  tagPattern.lastIndex = startIndex;

  let depth = 0;
  let match;

  while ((match = tagPattern.exec(html)) !== null) {
    const isClosingTag = match[1] === '/';
    if (isClosingTag) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(startIndex, tagPattern.lastIndex);
      }

      continue;
    }

    depth += 1;
  }

  return '';
}

function extractElementBlocksByClassFragments(html, tagName, classFragments) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const blocks = [];
  let match;

  while ((match = pattern.exec(html)) !== null) {
    const openingTag = match[0];
    if (!hasAllClassFragments(openingTag, classFragments)) {
      continue;
    }

    const block = extractBalancedElementAt(html, match.index, tagName);
    if (block) {
      blocks.push(block);
    }
  }

  return blocks;
}

function extractElementInnerHtml(block) {
  const tagEndIndex = findTagEnd(block, 0);
  if (tagEndIndex === -1) {
    return '';
  }

  const closingTagIndex = block.lastIndexOf('</');
  if (closingTagIndex === -1 || closingTagIndex <= tagEndIndex) {
    return '';
  }

  return block.slice(tagEndIndex + 1, closingTagIndex);
}

function extractTextByClassFragment(block, classFragment) {
  const pattern = new RegExp(
    `<[^>]*class="[^"]*${classFragment}[^"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>`,
    'i'
  );
  const match = block.match(pattern);
  return match ? decodeHtml(match[1]) : '';
}

function extractHrefByClassFragment(block, classFragment) {
  const pattern = new RegExp(
    `<a[^>]*class="[^"]*${classFragment}[^"]*"[^>]*href="([^"]+)"`,
    'i'
  );
  const match = block.match(pattern);
  return match ? decodeHtml(match[1]) : '';
}

function extractImageUrl(block) {
  const delayedMatch = block.match(/data-delayed-url="([^"]+)"/i);
  if (delayedMatch) {
    return decodeHtml(delayedMatch[1]);
  }

  const srcMatch = block.match(/<img[^>]*src="([^"]+)"/i);
  return srcMatch ? decodeHtml(srcMatch[1]) : '';
}

function extractSalary(block) {
  const salaryText =
    extractTextByClassFragment(block, 'job-search-card__salary-info') ||
    extractTextByClassFragment(block, 'search-card__salary-info');

  if (salaryText) {
    return salaryText;
  }

  const moneyLikeMatch = block.match(
    /([$€£]\s?\d[\d,]*(?:\s?[-–]\s?[$€£]?\s?\d[\d,]*)?(?:\s?[kKmM])?)/i
  );
  return moneyLikeMatch ? decodeHtml(moneyLikeMatch[1]) : '';
}

function extractCountFromText(value) {
  const match = String(value ?? '')
    .replace(/,/g, '')
    .match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function toAbsoluteLinkedInUrl(url) {
  if (!url) {
    return '';
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return `https://www.linkedin.com${url}`;
  }

  return url;
}

function parseJobCard(block) {
  const jobUrl =
    extractHrefByClassFragment(block, 'base-card__full-link') ||
    extractHrefByClassFragment(block, 'job-search-card__link') ||
    extractHrefByClassFragment(block, 'base-card__link');
  const timeMatch = block.match(/<time[^>]*datetime="([^"]+)"/i);
  const agoTime =
    extractTextByClassFragment(block, 'job-search-card__listdate') ||
    extractTextByClassFragment(block, 'job-search-card__listdate--new') ||
    extractTextByClassFragment(block, 'base-search-card__listdate');

  return {
    position:
      extractTextByClassFragment(block, 'base-search-card__title') ||
      extractTextByClassFragment(block, 'job-search-card__title') ||
      '',
    company:
      extractTextByClassFragment(block, 'base-search-card__subtitle') ||
      extractTextByClassFragment(block, 'job-search-card__subtitle') ||
      '',
    companyLogo: extractImageUrl(block),
    location:
      extractTextByClassFragment(block, 'job-search-card__location') ||
      extractTextByClassFragment(block, 'base-search-card__metadata') ||
      '',
    date: timeMatch ? decodeHtml(timeMatch[1]) : '',
    agoTime,
    salary: extractSalary(block),
    jobUrl: toAbsoluteLinkedInUrl(jobUrl),
    description: '',
    applyClicks: null,
    applyClicksText: '',
    optionalLowEmphasisText: '',
    detailLowEmphasisTexts: [],
    detailLowEmphasisContentTexts: [],
  };
}

function extractDescriptionFromCandidateBlock(block) {
  const contentMatch = block.match(/^[\s\S]*?>([\s\S]*?)<\/div>\s*$/i);
  if (!contentMatch) {
    return '';
  }

  return decodeHtml(contentMatch[1]);
}

function parseJobDescriptionFromHtml(html) {
  const descriptionPatterns = [
    /<div[^>]*class="[^"]*feed-shared-inline-show-more-text[^"]*text-body-small-open[^"]*"[^>]*>[\s\S]*?<\/div>/i,
    /<div[^>]*class="[^"]*show-more-less-html__markup[^"]*"[^>]*>[\s\S]*?<\/div>/i,
  ];

  for (const pattern of descriptionPatterns) {
    const match = html.match(pattern);
    if (!match) {
      continue;
    }

    const description = extractDescriptionFromCandidateBlock(match[0]);
    if (description) {
      return description;
    }
  }

  return '';
}

function parseLowEmphasisSpansFromHtml(html) {
  const tertiaryDescriptionBlocks = extractElementBlocksByClassFragments(
    html,
    'div',
    ['job-details-jobs-unified-top-card__tertiary-description-container']
  );
  const texts = [];

  for (const block of tertiaryDescriptionBlocks) {
    const spanBlocks = extractElementBlocksByClassFragments(block, 'span', [
      'tvm__text',
      'tvm__text--low-emphasis',
    ]);

    for (const spanBlock of spanBlocks) {
      const text = decodeHtml(extractElementInnerHtml(spanBlock));
      if (text) {
        texts.push(text);
      }
    }
  }

  if (texts.length > 0) {
    return texts;
  }
  
  return [];
}

function parseLegacyTopCardMetadataTextsFromHtml(html) {
  const secondSublineBlocks = extractElementBlocksByClassFragments(html, 'h4', [
    'top-card-layout__second-subline',
  ]);
  const texts = [];

  for (const block of secondSublineBlocks) {
    const locationBlocks = extractElementBlocksByClassFragments(block, 'span', [
      'topcard__flavor',
      'topcard__flavor--bullet',
    ]);
    const postedTimeBlocks = extractElementBlocksByClassFragments(block, 'span', [
      'posted-time-ago__text',
      'topcard__flavor--metadata',
    ]);
    const applicantSpanBlocks = extractElementBlocksByClassFragments(block, 'span', [
      'num-applicants__caption',
    ]);
    const applicantCaptionBlocks = extractElementBlocksByClassFragments(
      block,
      'figcaption',
      ['num-applicants__caption']
    );

    for (const candidateBlock of [
      ...locationBlocks,
      ...postedTimeBlocks,
      ...applicantSpanBlocks,
      ...applicantCaptionBlocks,
    ]) {
      const text = decodeHtml(extractElementInnerHtml(candidateBlock));
      if (text) {
        texts.push(text);
      }
    }
  }

  return texts;
}

function parseApplyClickMetadataFromHtml(html) {
  const lowEmphasisTexts = parseLowEmphasisSpansFromHtml(html);
  const metadataTexts =
    lowEmphasisTexts.length > 0
      ? lowEmphasisTexts
      : parseLegacyTopCardMetadataTextsFromHtml(html);
  const detailLowEmphasisContentTexts = metadataTexts.filter(
    (text) => normalizeText(text) !== '·'
  );
  const applyClickText =
    detailLowEmphasisContentTexts.find((text) => {
      const normalized = normalizeText(text);
      return (
        normalized.includes('clicked apply') ||
        normalized.includes('applicant')
      );
    }) || '';

  const optionalLowEmphasisText =
    detailLowEmphasisContentTexts.find((text) => text !== applyClickText) || '';

  return {
    applyClicksText: applyClickText,
    applyClicks: applyClickText ? extractCountFromText(applyClickText) : null,
    optionalLowEmphasisText,
    detailLowEmphasisTexts: metadataTexts,
    detailLowEmphasisContentTexts,
  };
}

async function enrichJobWithDescription(job) {
  if (!job.jobUrl) {
    return job;
  }

  try {
    const detailHtml = await fetchHtml(job.jobUrl);
    const applyClickMetadata = parseApplyClickMetadataFromHtml(detailHtml);
    return {
      ...job,
      description: parseJobDescriptionFromHtml(detailHtml),
      ...applyClickMetadata,
    };
  } catch (error) {
    return {
      ...job,
      description: '',
      applyClicks: null,
      applyClicksText: '',
      optionalLowEmphasisText: '',
      detailLowEmphasisTexts: [],
      detailLowEmphasisContentTexts: [],
      descriptionError: error.message,
    };
  }
}

function parseJobsFromHtml(html) {
  const jobBlocks =
    html.match(/<li\b[\s\S]*?<div[^>]*class="[^"]*base-card[^"]*"[\s\S]*?<\/li>/gi) ||
    html.match(/<div[^>]*class="[^"]*base-card[^"]*"[\s\S]*?<\/div>\s*<\/li>/gi) ||
    [];

  const seenUrls = new Set();
  const jobs = [];

  for (const block of jobBlocks) {
    const job = parseJobCard(block);
    if (!job.position || !job.company || !job.jobUrl) {
      continue;
    }

    if (seenUrls.has(job.jobUrl)) {
      continue;
    }

    seenUrls.add(job.jobUrl);
    jobs.push(job);
  }

  return jobs;
}

function buildQueryOptions(rawOptions = {}) {
  const limit = Math.max(1, toPositiveInteger(rawOptions.limit, DEFAULT_LIMIT));
  const start = toPositiveInteger(
    rawOptions.start ?? rawOptions.offset ?? rawOptions.page,
    0
  );
  const options = {
    keyword: String(rawOptions.keyword ?? '').trim(),
    location: String(rawOptions.location ?? '').trim(),
    dateSincePosted: String(rawOptions.dateSincePosted ?? '').trim(),
    jobType: String(rawOptions.jobType ?? '').trim(),
    remoteFilter: String(rawOptions.remoteFilter ?? '').trim(),
    salary: String(rawOptions.salary ?? '').trim(),
    experienceLevel: String(rawOptions.experienceLevel ?? '').trim(),
    sortBy: String(rawOptions.sortBy ?? '').trim(),
    limit,
    start,
    has_verification: normalizeBoolean(
      rawOptions.has_verification ?? rawOptions.hasVerification,
      false
    ),
    under_10_applicants: normalizeBoolean(
      rawOptions.under_10_applicants ?? rawOptions.under10Applicants,
      false
    ),
  };

  return options;
}

function buildSearchUrl(rawOptions = {}, startOffset) {
  const options = buildQueryOptions(rawOptions);
  const effectiveStart = toPositiveInteger(startOffset, options.start);
  const params = new URLSearchParams();

  if (options.keyword) {
    params.set('keywords', options.keyword);
  }

  if (options.location) {
    params.set('location', options.location);
  }

  params.set('start', String(effectiveStart));

  const dateSincePosted = DATE_SINCE_POSTED_MAP[normalizeText(options.dateSincePosted)];
  if (dateSincePosted) {
    params.set('f_TPR', dateSincePosted);
  }

  const jobType = JOB_TYPE_MAP[normalizeText(options.jobType)];
  if (jobType) {
    params.set('f_JT', jobType);
  }

  const remoteFilter = REMOTE_FILTER_MAP[normalizeText(options.remoteFilter)];
  if (remoteFilter) {
    params.set('f_WT', remoteFilter);
  }

  const salary = SALARY_MAP[normalizeText(options.salary)];
  if (salary) {
    params.set('f_SB2', salary);
  }

  const experienceLevel =
    EXPERIENCE_LEVEL_MAP[normalizeText(options.experienceLevel)];
  if (experienceLevel) {
    params.set('f_E', experienceLevel);
  }

  const sortBy = SORT_BY_MAP[normalizeText(options.sortBy)];
  if (sortBy) {
    params.set('sortBy', sortBy);
  }

  if (options.under_10_applicants) {
    params.set('f_JIYN', 'true');
  }

  // LinkedIn exposes a "Has verifications" filter in the jobs UI. The public
  // guest endpoint accepts this boolean filter under f_VJ.
  if (options.has_verification) {
    params.set('f_VJ', 'true');
  }

  return `${SEARCH_URL}?${params.toString()}`;
}

async function fetchSearchBatch(rawOptions = {}, startOffset = 0) {
  const url = buildSearchUrl(rawOptions, startOffset);
  const html = await fetchHtml(url);
  return {
    html,
    jobs: parseJobsFromHtml(html),
    url,
  };
}

async function query(rawOptions = {}) {
  const options = buildQueryOptions(rawOptions);
  const startPosition = options.start;
  const requestedLimit = options.limit;
  const jobs = [];
  const seenUrls = new Set();
  let nextStart = startPosition;

  while (jobs.length < requestedLimit) {
    const { jobs: batchJobs } = await fetchSearchBatch(options, nextStart);

    if (batchJobs.length === 0) {
      break;
    }

    for (const job of batchJobs) {
      if (seenUrls.has(job.jobUrl)) {
        continue;
      }

      seenUrls.add(job.jobUrl);
      jobs.push(job);

      if (jobs.length >= requestedLimit) {
        break;
      }
    }

    if (batchJobs.length < LINKEDIN_BATCH_SIZE) {
      break;
    }

    nextStart += LINKEDIN_BATCH_SIZE;
  }

  const trimmedJobs = jobs.slice(0, requestedLimit);
  return Promise.all(trimmedJobs.map((job) => enrichJobWithDescription(job)));
}

function printHelp() {
  console.log(`Usage:
  ./linkedin_jobs_api_test.js [options]

Options:
  --keyword <text>              Search keyword, e.g. "software engineer"
  --location <text>             Search location, e.g. "Australia"
  --dateSincePosted <value>     1hr, 24hr, past week, past month
  --showUrl                     Print the generated search URL before the request
  --limit <number>              Number of jobs to return, default 20
  --start <number>              Zero-based starting job position, default 0
  --offset <number>             Alias for --start
  --page <number>               Deprecated alias for --start
  --sortBy <value>              recent or relevant
  
  --pretty                      Pretty-print JSON output
  --jobType <value>             full time, part time, contract, temporary, volunteer, internship
  --remoteFilter <value>        on site, remote, hybrid
  --salary <value>              40000, 60000, 80000, 100000, 120000
  --experienceLevel <value>     internship, entry level, associate, senior, director, executive
  --hasVerification <boolean>   true or false
  --under10Applicants <boolean> true or false
  --help                        Show this help

Examples:
    Note: "--dateSincePosted "past week" affects the number of output entries.
  ./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js --keyword "data" --location "Australia" --sortBy recent --start 0 --showUrl
  ./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js --keyword "data" --location "Australia" --sortBy recent --start 0 --dateSincePosted "24hr" --showUrl
  ./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js --keyword "data" --location "Australia" --sortBy recent --start 0 --dateSincePosted "past week" --showUrl
  ./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js --keyword "product manager" --remoteFilter remote --sortBy recent --under10Applicants true --pretty
`);
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

async function main() {
  const cliOptions = parseCliArgs(process.argv);

  if (cliOptions.help) {
    printHelp();
    return;
  }

  const runtimeOptions = buildQueryOptions({
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
  });

  if (cliOptions.showUrl) {
    console.error(`Search URL: ${buildSearchUrl(runtimeOptions, runtimeOptions.start)}`);
  }

  const jobs = await query(runtimeOptions);
  const spacing = cliOptions.pretty ? 2 : 0;
  console.log(JSON.stringify(jobs, null, spacing));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  buildQueryOptions,
  buildSearchUrl,
  parseJobsFromHtml,
  query,
};
