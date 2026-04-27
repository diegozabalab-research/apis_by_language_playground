# LinkedIn Jobs API Promotion Report

## Scope

Promote the three LinkedIn API scripts from `c_tests/personal/dza/linkedin_jobs_api/` into reusable base code under `b_code_base/source`, preserve the existing CLI entrypoints and flags, add universal unit tests, and document the incremental change.

## Staged Implementation Plan

1. Inspect the existing three scripts, their shared logic, and the repository Node.js clean-code standard.
2. Define a base module layout under `b_code_base/source/linkedin-jobs-api/` that separates shared helpers, search logic, all-pages orchestration, and single-job parsing.
3. Extract reusable logic first:
   - normalization and integer parsing
   - LinkedIn request headers and fetch handling
   - HTML decoding and count extraction
   - CLI argument value parsing
4. Move the search API into base modules:
   - option building
   - search URL construction
   - search-result parsing
   - detail-page enrichment
   - CLI runner
5. Move the all-pages API into base modules:
   - wrapper option normalization
   - one-at-a-time orchestration
   - throttling helper
   - CLI runner
6. Move the single-job API into base modules:
   - job ID extraction
   - queried URL building
   - applicant-count parsing
   - active-state parsing
   - CLI runner
7. Replace the original three scripts with thin compatibility wrappers that keep the same executable names, flags, and exported API surface.
8. Add deterministic unit tests under `c_tests/universal/unit/linkedin-jobs-api/` using fixture HTML and injected test doubles.
9. Run the unit suite and CLI smoke checks.

## Plan Review And Applied Changes

Initial review found two main risks:

1. The Node clean-code line cap would be violated if the HTML parsing helpers stayed grouped too broadly.
   - Applied change: split the HTML extractor responsibilities into smaller files.
2. Preserving the current way to run the APIs was more important than forcing a module-system change at the old entrypoints.
   - Applied change: keep the legacy scripts as CommonJS wrappers and move the implementation behind them into base modules.

Implementation review found two more issues and corrected them before final verification:

1. The first extraction of the balanced HTML element reader relied on `matchAll()` in a way that did not preserve the right closing index.
   - Applied change: switch that logic to `RegExp.exec()` iteration.
2. The search orchestrator dropped the injected `fetchHtml` dependency during batch fetching.
   - Applied change: pass the injected fetch implementation through the search collection path.

## Resulting Structure

New base code:

- `b_code_base/source/linkedin-jobs-api/constants/`
- `b_code_base/source/linkedin-jobs-api/shared/`
- `b_code_base/source/linkedin-jobs-api/search/`
- `b_code_base/source/linkedin-jobs-api/all-pages/`
- `b_code_base/source/linkedin-jobs-api/single-job/`

Compatibility wrappers retained:

- `c_tests/personal/dza/linkedin_jobs_api/linkedin_jobs_api_test.js`
- `c_tests/personal/dza/linkedin_jobs_api/linkedin_jobs_api_all_pages.js`
- `c_tests/personal/dza/linkedin_jobs_api/linkedin_single_job_api_test.js`

Universal unit tests added:

- `c_tests/universal/unit/linkedin-jobs-api/linkedin-jobs-search-api.test.js`
- `c_tests/universal/unit/linkedin-jobs-api/linkedin-jobs-all-pages-api.test.js`
- `c_tests/universal/unit/linkedin-jobs-api/linkedin-single-job-api.test.js`
- `c_tests/universal/unit/linkedin-jobs-api/fixtures/`

## Verification

Executed:

- `node --test c_tests/universal/unit/linkedin-jobs-api/*.test.js`
- `node c_tests/personal/dza/linkedin_jobs_api/linkedin_jobs_api_test.js --help`
- `node c_tests/personal/dza/linkedin_jobs_api/linkedin_jobs_api_all_pages.js --help`
- `node c_tests/personal/dza/linkedin_jobs_api/linkedin_single_job_api_test.js --help`

Result:

- Unit tests passed: 7/7
- CLI help smoke checks passed for all three compatibility entrypoints

## Notes

- Live LinkedIn network calls were not used for verification; the test suite is fixture-driven and deterministic.
- The external CLI contract was preserved at the original script paths with the same flag names and parameter conventions.
