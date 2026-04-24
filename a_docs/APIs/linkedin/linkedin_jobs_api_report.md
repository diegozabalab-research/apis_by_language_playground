# LinkedIn Jobs API Report

## Scope

This report documents the current behavior of the local LinkedIn jobs scripts in:

- `c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js`
- `c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js`

The notes below are based on the behavior discussed and implemented in this repository.

## Main Findings

- The LinkedIn guest jobs endpoint uses a `start` query parameter as a zero-based pointer into the result list.
- `start=0` begins at the first visible job.
- `start=5` begins at the sixth visible job and effectively hides entries before that position.
- The old `page` naming was misleading. In this codebase, `--page` is now only a deprecated alias for `--start`.
- In practice, the single-search flow did not behave like a true 25-item page API. During testing, responses appeared to expose a smaller visible window, often around 8 entries.
- The all-pages wrapper no longer assumes fixed-size pages. It now crawls the list one position at a time.
- The result space appears capped at 999 entries. The wrapper stops at that boundary.
- LinkedIn rate limits aggressively. A `429 Too Many Requests` response was observed, so the wrapper now sleeps for 5 seconds after every 10 requests.

## Expected Results

### `linkedin_jobs_api_test.js`

Expected behavior:

- Accepts the normal search filters such as `keyword`, `location`, `dateSincePosted`, `jobType`, `remoteFilter`, `salary`, `experienceLevel`, `sortBy`, `hasVerification`, and `under10Applicants`.
- Accepts `--start` as the primary positional parameter.
- Accepts `--offset` and `--page` as compatibility aliases for `--start`.
- Returns up to `--limit` enriched job objects starting from the requested `start` position.
- Each returned item is enriched with the job description and additional metadata extracted from the job detail page when available.

Example expectation:

- `--start 0 --limit 5` should return the first 5 available jobs from the current visible list.
- `--start 5 --limit 5` should return jobs starting from the sixth visible entry.

### `linkedin_jobs_api_all_pages.js`

Expected behavior:

- Ignores incoming `--start`, `--offset`, `--page`, and `--limit` for crawling behavior.
- Always begins the crawl at `start=0`.
- Calls the single API with `limit=1`.
- Stores only the first returned entry from each call.
- Increments `start` by exactly 1 after each successful request.
- Stops when:
  - no entry is returned, or
  - `999` collected entries is reached, or
  - `--maxEntries` is reached.
- Waits 5 seconds after every 10 requests to reduce rate limiting.

This means the wrapper is intentionally conservative. It prioritizes stable sequential extraction over speed.

## How To Use The API

### Single search script

Basic usage:

```bash
./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js \
  --keyword "product manager" \
  --location "Australia" \
  --start 0 \
  --limit 5 \
  --pretty
```

Recent jobs example:

```bash
./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_test.js \
  --keyword "data" \
  --location "Australia" \
  --sortBy recent \
  --dateSincePosted "24hr" \
  --start 0 \
  --showUrl
```

Notes:

- Use `--start` when you want to manually inspect a specific position in the result list.
- Use `--showUrl` to inspect the generated LinkedIn guest search URL.

### All entries wrapper

Basic usage:

```bash
./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js \
  --keyword "product manager" \
  --remoteFilter remote \
  --sortBy recent \
  --maxEntries 100 \
  --pretty
```

Smaller capped crawl:

```bash
./c_tests/personal/dza/github_linkedin_jobs_api/linkedin_jobs_api_all_pages.js \
  --keyword "data engineer" \
  --location "Australia" \
  --maxEntries 20 \
  --pretty
```

Notes:

- `--maxEntries` is the active safety cap for the wrapper.
- `--maxResults`, `--maxRequests`, and `--maxPages` are accepted as compatibility aliases.
- The wrapper is slower by design because it makes one request per list position and pauses every 10 requests.

## Operational Guidance

- Prefer `linkedin_jobs_api_test.js` when you want a small sample or want to inspect one part of the list manually.
- Prefer `linkedin_jobs_api_all_pages.js` when you need the broadest possible extraction from the visible guest result set.
- Expect incomplete extraction if LinkedIn changes guest HTML, query behavior, or rate limiting.
- Expect result drift over time because LinkedIn search ordering can change while the crawl is running.

## Current Limitations

- The implementation depends on LinkedIn's public guest HTML structure.
- The result set may be unstable while crawling because newer jobs can appear and ordering can change.
- A hard ceiling of 999 visible entries appears to apply.
- The wrapper is network-heavy and can still hit throttling despite the 5-second backoff every 10 requests.
