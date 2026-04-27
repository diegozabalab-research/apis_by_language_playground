'use strict';

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
`);
}

module.exports = {
  printHelp,
};
