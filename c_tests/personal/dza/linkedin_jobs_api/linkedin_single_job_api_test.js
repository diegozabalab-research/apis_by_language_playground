#!/usr/bin/env node

'use strict';

const singleJobApi =
  require('../../../../b_code_base/source/linkedin-jobs-api/single-job/linkedin-single-job-api');
const {
  runLinkedinSingleJobCli,
} = require('../../../../b_code_base/source/linkedin-jobs-api/single-job/run-linkedin-single-job-cli');

if (require.main === module) {
  runLinkedinSingleJobCli().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = singleJobApi;
