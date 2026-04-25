#!/usr/bin/env node

'use strict';

function decodeHtmlEntities(value) {
  return String(value ?? '')
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
    );
}

function decodeHtml(value) {
  return decodeHtmlEntities(String(value ?? '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCountFromText(value) {
  const match = String(value ?? '')
    .replace(/,/g, '')
    .match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
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

function extractJobIdFromUrl(inputUrl) {
  const parsedUrl = new URL(inputUrl);
  const pathname = parsedUrl.pathname;
  const pathnameMatch = pathname.match(/\/jobs\/view\/(?:[^/?#]*-)?(\d+)/i);
  if (pathnameMatch) {
    return pathnameMatch[1];
  }

  const genericMatch = parsedUrl.href.match(/(\d{7,})/);
  if (genericMatch) {
    return genericMatch[1];
  }

  throw new Error(`Unable to extract LinkedIn job ID from URL: ${inputUrl}`);
}

function buildQueriedJobUrl(inputUrl) {
  const parsedUrl = new URL(inputUrl);
  if (
    parsedUrl.hostname === 'www.linkedin.com' &&
    /^\/jobs-guest\/jobs\/api\/jobPosting\/\d+$/i.test(parsedUrl.pathname)
  ) {
    return parsedUrl.toString();
  }

  const jobId = extractJobIdFromUrl(inputUrl);
  return `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;
}

function parseApplyClicksFromHtml(html) {
  const applicantPatterns = [
    /<(span|figcaption)[^>]*class="[^"]*num-applicants__caption[^"]*"[^>]*>([\s\S]*?)<\/\1>/i,
    /<(span|figcaption|div|p)[^>]*>([\s\S]{0,120}?\b(?:Be among the first \d+ applicants|\d[\d,]* applicants)\b[\s\S]{0,120}?)<\/\1>/i,
  ];

  for (const pattern of applicantPatterns) {
    const match = html.match(pattern);
    if (!match) {
      continue;
    }

    const applyClicksText = decodeHtml(match[2]);
    return {
      applyClicks: extractCountFromText(applyClicksText),
      applyClicksText,
    };
  }

  return {
    applyClicks: null,
    applyClicksText: '',
  };
}

function isStillActiveFromHtml(html) {
  const closedLabelPattern =
    /<figcaption[^>]*class="[^"]*closed-job__flavor--closed[^"]*"[^>]*>\s*No longer accepting applications\s*<\/figcaption>/i;
  return !closedLabelPattern.test(html);
}

function parseJobPostingHtml(html, givenUrl, queriedUrl) {
  const { applyClicks, applyClicksText } = parseApplyClicksFromHtml(html);

  return {
    givenUrl,
    queriedUrl,
    applyClicks,
    applyClicksText,
    stillActive: isStillActiveFromHtml(html),
  };
}

function printHelp() {
  console.log(`Usage:
  ./linkedin_single_job_api_test.js --jobUrl <linkedin-job-url> [--pretty]
  ./linkedin_single_job_api_test.js <linkedin-job-url> [--pretty]

Input URL example:
  https://au.linkedin.com/jobs/view/junior-data-engineer-analyst-at-rassure-4403909274?position=1&pageNum=0&refId=Odtee%2BULy66fsL74IcQWbg%3D%3D&trackingId=SsmqDjxZmSvlXs%2FmboicTA%3D%3D

./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_single_job_api_test.js --jobUrl "https://au.linkedin.com/jobs/view/junior-data-engineer-analyst-at-rassure-4403909274?position=1&pageNum=0&refId=Odtee%2BULy66fsL74IcQWbg%3D%3D&trackingId=SsmqDjxZmSvlXs%2FmboicTA%3D%3D" --pretty

./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_single_job_api_test.js --jobUrl "https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/4334080570" --pretty

Queried URL example:
  https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/4403909274
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

    if (argument === '--jobUrl' || argument === '--job-url') {
      options.jobUrl = parseArgValue(args, index);
      index += 1;
      continue;
    }

    if (!argument.startsWith('-') && !options.jobUrl) {
      options.jobUrl = argument;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return options;
}

async function main() {
  const cliOptions = parseCliArgs(process.argv);

  if (cliOptions.help) {
    printHelp();
    return;
  }

  if (!cliOptions.jobUrl) {
    throw new Error('Missing LinkedIn job URL. Pass --jobUrl <url>.');
  }

  const queriedUrl = buildQueriedJobUrl(cliOptions.jobUrl);
  const html = await fetchHtml(queriedUrl);
  const result = parseJobPostingHtml(html, cliOptions.jobUrl, queriedUrl);
  const spacing = cliOptions.pretty ? 2 : 0;
  console.log(JSON.stringify(result, null, spacing));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  buildQueriedJobUrl,
  extractJobIdFromUrl,
  isStillActiveFromHtml,
  parseApplyClicksFromHtml,
  parseJobPostingHtml,
};
