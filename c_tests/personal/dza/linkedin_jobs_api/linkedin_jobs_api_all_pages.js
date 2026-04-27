#!/usr/bin/env node

'use strict';

const allPagesApi =
  require('../../../../b_code_base/source/linkedin-jobs-api/all-pages/linkedin-jobs-all-pages-api');
const {
  runLinkedinJobsAllPagesCli,
} = require('../../../../b_code_base/source/linkedin-jobs-api/all-pages/run-linkedin-jobs-all-pages-cli');

if (require.main === module) {
  runLinkedinJobsAllPagesCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = allPagesApi;
