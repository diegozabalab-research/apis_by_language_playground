'use strict';

const LINKEDIN_SEARCH_CONFIG = Object.freeze({
  defaultLimit: 20,
  searchBatchSize: 25,
  searchUrl:
    'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search',
});

module.exports = {
  LINKEDIN_SEARCH_CONFIG,
};
