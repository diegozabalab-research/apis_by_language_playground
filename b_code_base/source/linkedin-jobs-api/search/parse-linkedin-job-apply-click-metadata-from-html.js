'use strict';

const { extractCountFromText } =
  require('../shared/extract-count-from-text');
const { normalizeText } =
  require('../shared/normalize-option-values');
const {
  extractLinkedinDetailLowEmphasisTexts,
} = require('./extract-linkedin-detail-low-emphasis-texts');

function parseApplyClickMetadataFromHtml(html) {
  const detailLowEmphasisTexts =
    extractLinkedinDetailLowEmphasisTexts(html);
  const detailLowEmphasisContentTexts =
    detailLowEmphasisTexts.filter((text) => normalizeText(text) !== '·');
  const applyClicksText =
    detailLowEmphasisContentTexts.find((text) => isApplyClickText(text)) || '';
  const optionalLowEmphasisText =
    detailLowEmphasisContentTexts.find((text) => text !== applyClicksText) || '';

  return {
    applyClicks: applyClicksText ? extractCountFromText(applyClicksText) : null,
    applyClicksText,
    detailLowEmphasisContentTexts,
    detailLowEmphasisTexts,
    optionalLowEmphasisText,
  };
}

function isApplyClickText(text) {
  const normalizedText =
    normalizeText(text);

  return (
    normalizedText.includes('applicant') ||
    normalizedText.includes('clicked apply')
  );
}

module.exports = {
  parseApplyClickMetadataFromHtml,
};
