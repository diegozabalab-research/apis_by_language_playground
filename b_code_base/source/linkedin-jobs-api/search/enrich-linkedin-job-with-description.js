'use strict';

const { fetchLinkedinHtml } =
  require('../shared/fetch-linkedin-html');
const {
  parseApplyClickMetadataFromHtml,
} = require('./parse-linkedin-job-apply-click-metadata-from-html');
const {
  parseJobDescriptionFromHtml,
} = require('./parse-linkedin-job-description-from-html');

async function enrichJobWithDescription({
  fetchHtml = fetchLinkedinHtml,
  job,
}) {
  if (!job.jobUrl) {
    return job;
  }

  try {
    const detailHtml =
      await fetchHtml(job.jobUrl);

    return {
      ...job,
      ...parseApplyClickMetadataFromHtml(detailHtml),
      description: parseJobDescriptionFromHtml(detailHtml),
    };
  } catch (error) {
    return {
      ...job,
      applyClicks: null,
      applyClicksText: '',
      description: '',
      descriptionError: error.message,
      detailLowEmphasisContentTexts: [],
      detailLowEmphasisTexts: [],
      optionalLowEmphasisText: '',
    };
  }
}

module.exports = {
  enrichJobWithDescription,
};
