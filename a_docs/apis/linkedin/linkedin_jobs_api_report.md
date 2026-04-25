# LinkedIn Jobs API Report

## Scope

This report documents the current behavior of the LinkedIn jobs scripts in:

- `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js`
- `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_single_job_api_test.js`
- `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js`

The notes below are based on the current code in this repository.

## Current API Set

There are now 3 related APIs/scripts:

1. `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js`
   Fetches job search results for a given keyword and optional filters, then enriches each returned job with data from the LinkedIn job detail page.
2. `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_single_job_api_test.js`
   Fetches the data for a single job listing when given a LinkedIn job URL.
3. `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js`
   Uses `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js`, iterates through the result list one position at a time, retrieves up to `N` jobs, and waits 5 seconds after every 10 requests.

## Main Findings

- The LinkedIn guest jobs search endpoint uses a `start` query parameter as a zero-based pointer into the result list.
- `start=0` begins at the first visible job.
- `start=5` begins at the sixth visible job and skips earlier visible entries.
- In this codebase, `--page` and `--offset` are compatibility aliases for `--start`.
- `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js` does more than return list cards. It also opens each job detail page and enriches the returned objects with description and apply/applicant metadata when available.
- `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_single_job_api_test.js` is a dedicated single-job detail API. It accepts a normal LinkedIn job URL or a direct guest `jobPosting` URL and returns detail-level metadata for that listing.
- `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js` does not assume a fixed page size for crawling logic. It advances through the result space by incrementing `start` by 1 on each request while calling the search API with `limit=1`.
- The all-pages wrapper stops when no result is returned, when the configured maximum is reached, or when the apparent LinkedIn ceiling of `999` entries is reached.
- To reduce throttling risk, the all-pages wrapper sleeps for 5 seconds after every 10 requests.

## API Details

### `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js`

Expected behavior:

- Accepts search filters such as `keyword`, `location`, `dateSincePosted`, `jobType`, `remoteFilter`, `salary`, `experienceLevel`, `sortBy`, `hasVerification`, and `under10Applicants`.
- Accepts `--start` as the primary starting position parameter.
- Accepts `--offset` and `--page` as aliases for `--start`.
- Accepts `--limit` to control the number of jobs returned.
- Fetches search batches from the LinkedIn guest jobs search endpoint.
- Parses the job cards from the returned HTML.
- Enriches each returned job by requesting its individual detail page and extracting:
  - `description`
  - `applyClicks`
  - `applyClicksText`
  - `optionalLowEmphasisText`
  - `detailLowEmphasisTexts`
  - `detailLowEmphasisContentTexts`
- Returns up to `--limit` enriched jobs starting from the requested `start` position.

Example expectations:

- `--start 0 --limit 5` returns the first 5 visible jobs from the current result list.
- `--start 5 --limit 5` returns jobs beginning from the sixth visible job.

### `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_single_job_api_test.js`

Expected behavior:

- Accepts `--jobUrl <linkedin-job-url>` or a positional LinkedIn job URL.
- Accepts either:
  - a normal LinkedIn job listing URL such as `https://au.linkedin.com/jobs/view/...`
  - a guest API URL such as `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/<jobId>`
- Normalizes the input into the guest `jobPosting` URL.
- Requests the job detail HTML for that single listing.
- Returns:
  - `givenUrl`
  - `queriedUrl`
  - `applyClicks`
  - `applyClicksText`
  - `stillActive`

This script is the simplest way to inspect one listing directly without running a keyword search first.

### `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js`

Expected behavior:

- Reuses `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js` via its exported helpers.
- Always begins the crawl at `start=0`.
- Accepts `--maxEntries` as the active cap for the number of jobs to collect.
- Accepts `--maxResults`, `--maxRequests`, and `--maxPages` as compatibility aliases for the same effective cap.
- Accepts `--start`, `--offset`, `--page`, and `--limit` for compatibility, but ignores them for crawl behavior.
- Calls the search API repeatedly with `limit=1`.
- Stores the first returned job from each request.
- Increments `start` by exactly 1 after each successful request.
- Waits 5 seconds after every 10 requests.
- Stops when:
  - no job is returned, or
  - `--maxEntries` is reached, or
  - the internal ceiling of `999` entries is reached.

This wrapper is intentionally conservative. It prioritizes broad sequential extraction over speed.

## How To Use The APIs

### Keyword search API

Basic usage:

```bash
../../../c_tests/personal/dza/linkedin_jobs_api/linkedin_jobs_api_test.js \
  --keyword "product manager" \
  --location "Australia" \
  --start 0 \
  --limit 5 \
  --pretty
```

Recent jobs example:

```bash
../../../c_tests/personal/dza/linkedin_jobs_api/linkedin_jobs_api_test.js \
  --keyword "data" \
  --location "Australia" \
  --sortBy recent \
  --dateSincePosted "24hr" \
  --start 0 \
  --showUrl
```

Notes:

- Use `--start` when you want to inspect a specific position in the result list.
- Use `--showUrl` to print the generated LinkedIn guest search URL.

### Single job API

Basic usage with a normal LinkedIn job URL:

```bash
../../../c_tests/personal/dza/linkedin_jobs_api/linkedin_single_job_api_test.js \
  --jobUrl "https://au.linkedin.com/jobs/view/junior-data-engineer-analyst-at-rassure-4403909274?position=1&pageNum=0&refId=Odtee%2BULy66fsL74IcQWbg%3D%3D&trackingId=SsmqDjxZmSvlXs%2FmboicTA%3D%3D" \
  --pretty
```

Basic usage with a direct guest job posting URL:

```bash
../../../c_tests/personal/dza/linkedin_jobs_api/linkedin_single_job_api_test.js \
  --jobUrl "https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/4334080570" \
  --pretty
```

Notes:

- This script is useful when you already have a listing URL and only need detail data for that single job.
- The output includes both the original input URL and the normalized queried guest URL.

### All pages API

Basic usage:

```bash
../../../c_tests/personal/dza/linkedin_jobs_api/linkedin_jobs_api_all_pages.js \
  --keyword "product manager" \
  --remoteFilter remote \
  --sortBy recent \
  --maxEntries 100 \
  --pretty
```

Smaller capped crawl:

```bash
../../../c_tests/personal/dza/linkedin_jobs_api/linkedin_jobs_api_all_pages.js \
  --keyword "data engineer" \
  --location "Australia" \
  --maxEntries 20 \
  --pretty
```

Notes:

- `--maxEntries` is the active crawl cap.
- The wrapper is slower by design because it makes one request per result position.
- The wrapper pauses for 5 seconds after every 10 requests.

## Operational Guidance

- Use `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js` when you want search-based retrieval for a keyword and optional filters.
- Use `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_single_job_api_test.js` when you already have a job URL and want detail data for one listing.
- Use `../../../c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js` when you want to walk the visible search result set sequentially and collect up to `N` entries.
- Expect incomplete extraction if LinkedIn changes guest HTML, query behavior, or rate limiting.
- Expect result drift over time because LinkedIn search ordering can change while the all-pages crawl is running.

## Current Limitations

- All three scripts depend on LinkedIn's public guest HTML structure.
- The search and detail parsers may break if LinkedIn changes markup or text labels.
- The search result set can change while crawling, so sequential extraction may drift.
- The apparent `999` result ceiling limits the maximum crawl size.
- The all-pages wrapper is request-heavy and can still hit throttling despite the 5-second backoff every 10 requests.
