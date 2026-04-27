#!/usr/bin/env node

'use strict';

const searchApi =
  require('../../../../b_code_base/source/linkedin-jobs-api/search/linkedin-jobs-search-api');
const {
  runLinkedinJobsSearchCli,
} = require('../../../../b_code_base/source/linkedin-jobs-api/search/run-linkedin-jobs-search-cli');

if (require.main === module) {
  runLinkedinJobsSearchCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = searchApi;
