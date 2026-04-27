'use strict';

const test =
  require('node:test');
const assert =
  require('node:assert/strict');

const {
  buildSearchUrl,
  query,
} = require('../../../../b_code_base/source/linkedin-jobs-api/search/linkedin-jobs-search-api');
const {
  readLinkedinJobsFixture,
} = require('./read-linkedin-jobs-fixture');

const SEARCH_RESULTS_HTML =
  readLinkedinJobsFixture('search-results.html');
const JOB_DETAIL_1001_HTML =
  readLinkedinJobsFixture('job-detail-1001.html');
const JOB_DETAIL_1002_HTML =
  readLinkedinJobsFixture('job-detail-1002.html');

test('buildSearchUrl maps the LinkedIn filter options into query parameters', () => {
  const searchUrl =
    new URL(buildSearchUrl({
      dateSincePosted: '24hr',
      experienceLevel: 'senior',
      hasVerification: true,
      jobType: 'full time',
      keyword: 'data engineer',
      location: 'Australia',
      remoteFilter: 'remote',
      salary: '100000',
      sortBy: 'recent',
      start: 5,
      under10Applicants: true,
    }));

  assert.equal(searchUrl.searchParams.get('keywords'), 'data engineer');
  assert.equal(searchUrl.searchParams.get('location'), 'Australia');
  assert.equal(searchUrl.searchParams.get('f_TPR'), 'r86400');
  assert.equal(searchUrl.searchParams.get('f_JT'), 'F');
  assert.equal(searchUrl.searchParams.get('f_WT'), '2');
  assert.equal(searchUrl.searchParams.get('f_SB2'), '4');
  assert.equal(searchUrl.searchParams.get('f_E'), '4');
  assert.equal(searchUrl.searchParams.get('sortBy'), 'DD');
  assert.equal(searchUrl.searchParams.get('f_VJ'), 'true');
  assert.equal(searchUrl.searchParams.get('f_JIYN'), 'true');
  assert.equal(searchUrl.searchParams.get('start'), '5');
});

test('query returns enriched jobs from search and detail HTML fixtures', async () => {
  const fetchHtml = async (url) => ({
    'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=data&location=Australia&start=0': SEARCH_RESULTS_HTML,
    'https://www.linkedin.com/jobs/view/1001': JOB_DETAIL_1001_HTML,
    'https://www.linkedin.com/jobs/view/1002': JOB_DETAIL_1002_HTML,
  })[url] ?? '';
  const jobs =
    await query({
      fetchHtml,
      keyword: 'data',
      limit: 2,
      location: 'Australia',
      start: 0,
    });

  assert.equal(jobs.length, 2);
  assert.equal(jobs[0].position, 'Data Engineer');
  assert.equal(jobs[0].salary, '$100,000');
  assert.equal(jobs[0].description, 'Build pipelines and improve platform quality.');
  assert.equal(jobs[0].applyClicks, 12);
  assert.equal(jobs[1].jobUrl, 'https://www.linkedin.com/jobs/view/1002');
  assert.equal(jobs[1].description, 'Own reporting and semantic modeling.');
  assert.equal(jobs[1].applyClicks, 7);
  assert.equal(jobs[1].optionalLowEmphasisText, 'Remote');
});
