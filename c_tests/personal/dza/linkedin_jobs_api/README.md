# github_linkedin_jobs_api

Executable Node.js API test harness for the LinkedIn jobs search flow.

## What it does

- Mirrors the option names documented in the upstream package README, with a clearer zero-based `start` option for the LinkedIn result position: `keyword`, `location`, `dateSincePosted`, `jobType`, `remoteFilter`, `salary`, `experienceLevel`, `limit`, `start`, `sortBy`, `has_verification`, and `under_10_applicants`
- Calls LinkedIn's public guest jobs search endpoint directly
- Parses the returned HTML into job objects with the same top-level shape used by the upstream package README
- Enriches each job with a `description` field fetched from the job detail page
- Extracts applicant or clicked-apply metadata into `applyClicks`, `applyClicksText`, and `optionalLowEmphasisText` when LinkedIn exposes it
- Captures every `tvm__text tvm__text--low-emphasis` span from the job detail page's tertiary description container into `detailLowEmphasisTexts`, plus a separator-free `detailLowEmphasisContentTexts` view; when LinkedIn serves the older public top-card HTML instead, it falls back to equivalent metadata like location, posted time, and applicant count
- Runs as a standalone executable with no third-party dependencies

## Files

- `linkedin_jobs_api_test.js`: executable CLI and reusable `query()` implementation for fetching a slice starting at a specific result position
- `linkedin_jobs_api_all_pages.js`: executable CLI and reusable `queryAll()` implementation for fetching every batch starting at a specific result position
- `package.json`: local Node entrypoint metadata

## Usage

From the repository root:

```bash
cd c_tests/personal/dza/linkedin_jobs_api
./linkedin_jobs_api_test.js --keyword "software engineer" --location "Australia" --limit 5 --pretty
```

Fetch every available batch starting from a specific result position:

```bash
cd c_tests/personal/dza/linkedin_jobs_api
./linkedin_jobs_api_all_pages.js --keyword "product manager" --remoteFilter remote --sortBy recent --maxEntries 100 --pretty
```

Or via npm:

```bash
cd c_tests/personal/dza/linkedin_jobs_api
npm start -- --keyword "product manager" --remoteFilter remote --sortBy recent --limit 5 --pretty
```

Show available flags:

```bash
./linkedin_jobs_api_test.js --help
```

## Notes

- `start` is a zero-based LinkedIn result position for `linkedin_jobs_api_test.js`. For example, `start=0` begins at the first job and `start=5` begins at the sixth job.
- `--page` is still accepted as a deprecated alias for `--start` so existing commands keep working.
- `linkedin_jobs_api_all_pages.js` always starts at `start=0`, requests one item at a time, keeps only the first returned entry, increments `start` by 1, and stops when no entry is returned or 999 items have been collected.
- `linkedin_jobs_api_all_pages.js` waits 5 seconds after every 10 requests to reduce `429 Too Many Requests` responses.
- `--maxEntries` is the current safety cap option for the wrapper. `--maxResults`, `--maxRequests`, and `--maxPages` are accepted as compatibility aliases.
- The implementation is based on the upstream README option contract and publicly documented LinkedIn guest jobs endpoints and selectors.
- LinkedIn can change its guest HTML structure or query parameters at any time, so this test harness is intentionally lightweight and easy to update.
