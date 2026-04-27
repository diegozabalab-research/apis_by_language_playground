'use strict';

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
  --start <number>              Accepted for compatibility and ignored
  --offset <number>             Accepted for compatibility and ignored
  --page <number>               Accepted for compatibility and ignored
  --sortBy <value>              recent or relevant
  --hasVerification <boolean>   true or false
  --under10Applicants <boolean> true or false
  --maxEntries <number>         Optional cap on collected entries, max 999
  --maxResults <number>         Alias for --maxEntries
  --maxRequests <number>        Deprecated alias for --maxEntries
  --maxPages <number>           Deprecated alias for --maxEntries
  --limit <number>              Accepted for compatibility and ignored by all-pages mode
  --pretty                      Pretty-print JSON output
  --showUrl                     Print the first generated search URL before requests
  --help                        Show this help
`);
}

module.exports = {
  printHelp,
};
