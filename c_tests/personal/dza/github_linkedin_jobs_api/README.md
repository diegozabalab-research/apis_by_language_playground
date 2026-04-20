# github_linkedin_jobs_api

Executable Node.js API test harness for the LinkedIn jobs search flow.

## What it does

- Mirrors the option names documented in the upstream package README: `keyword`, `location`, `dateSincePosted`, `jobType`, `remoteFilter`, `salary`, `experienceLevel`, `limit`, `page`, `sortBy`, `has_verification`, and `under_10_applicants`
- Calls LinkedIn's public guest jobs search endpoint directly
- Parses the returned HTML into job objects with the same top-level shape used by the upstream package README
- Enriches each job with a `description` field fetched from the job detail page
- Extracts applicant or clicked-apply metadata into `applyClicks`, `applyClicksText`, and `optionalLowEmphasisText` when LinkedIn exposes it
- Captures every `tvm__text tvm__text--low-emphasis` span from the job detail page's tertiary description container into `detailLowEmphasisTexts`, plus a separator-free `detailLowEmphasisContentTexts` view; when LinkedIn serves the older public top-card HTML instead, it falls back to equivalent metadata like location, posted time, and applicant count
- Runs as a standalone executable with no third-party dependencies

## Files

- `linkedin_jobs_api_test.js`: executable CLI and reusable `query()` implementation
- `package.json`: local Node entrypoint metadata

## Usage

From the repository root:

```bash
cd c_tests/personal/dza/github_linkedin_jobs_api
./linkedin_jobs_api_test.js --keyword "software engineer" --location "Australia" --limit 5 --pretty
```

Or via npm:

```bash
cd c_tests/personal/dza/github_linkedin_jobs_api
npm start -- --keyword "product manager" --remoteFilter remote --sortBy recent --limit 5 --pretty
```

Show available flags:

```bash
./linkedin_jobs_api_test.js --help
```

## Notes

- `page` is treated as a zero-based page offset using the requested `limit`, so `page=1` with `limit=10` starts at jobs 11-20.
- The implementation is based on the upstream README option contract and publicly documented LinkedIn guest jobs endpoints and selectors.
- LinkedIn can change its guest HTML structure or query parameters at any time, so this test harness is intentionally lightweight and easy to update.
