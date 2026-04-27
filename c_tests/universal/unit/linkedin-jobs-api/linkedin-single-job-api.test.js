'use strict';

const test =
  require('node:test');
const assert =
  require('node:assert/strict');

const {
  buildQueriedJobUrl,
  isStillActiveFromHtml,
  querySingleJob,
} = require('../../../../b_code_base/source/linkedin-jobs-api/single-job/linkedin-single-job-api');
const {
  readLinkedinJobsFixture,
} = require('./read-linkedin-jobs-fixture');

const SINGLE_JOB_ACTIVE_HTML =
  readLinkedinJobsFixture('single-job-active.html');
const SINGLE_JOB_CLOSED_HTML =
  readLinkedinJobsFixture('single-job-closed.html');

test('buildQueriedJobUrl converts a LinkedIn listing URL into the guest endpoint URL', () => {
  const queriedUrl =
    buildQueriedJobUrl('https://au.linkedin.com/jobs/view/lead-data-engineer-4403909274');

  assert.equal(
    queriedUrl,
    'https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/4403909274',
  );
});

test('querySingleJob returns parsed applicant counts and the normalized queried URL', async () => {
  const result =
    await querySingleJob({
      fetchHtml: async () => SINGLE_JOB_ACTIVE_HTML,
      jobUrl: 'https://www.linkedin.com/jobs/view/4403909274',
    });

  assert.equal(result.queriedUrl, 'https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/4403909274');
  assert.equal(result.applyClicks, 23);
  assert.equal(result.applyClicksText, '23 applicants');
  assert.equal(result.stillActive, true);
});

test('isStillActiveFromHtml returns false when LinkedIn marks a posting as closed', () => {
  assert.equal(isStillActiveFromHtml(SINGLE_JOB_CLOSED_HTML), false);
});
