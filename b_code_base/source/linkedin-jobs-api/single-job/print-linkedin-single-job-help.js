'use strict';

function printHelp() {
  console.log(`Usage:
  ./linkedin_single_job_api_test.js --jobUrl <linkedin-job-url> [--pretty]
  ./linkedin_single_job_api_test.js <linkedin-job-url> [--pretty]

Input URL example:
  https://au.linkedin.com/jobs/view/junior-data-engineer-analyst-at-rassure-4403909274

Queried URL example:
  https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/4403909274
`);
}

module.exports = {
  printHelp,
};
