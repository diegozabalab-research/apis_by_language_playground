'use strict';

const { decodeHtml } =
  require('../shared/decode-html');
const { extractCountFromText } =
  require('../shared/extract-count-from-text');
const {
  extractHrefByClassFragment,
  extractTextByClassFragment,
} = require('./extract-html-values-by-class');

function parseLinkedinJobCard(block) {
  const timeMatch =
    block.match(/<time[^>]*datetime="([^"]+)"/i);
  const jobUrl =
    extractHrefByClassFragment({ block, classFragment: 'base-card__full-link' }) ||
    extractHrefByClassFragment({ block, classFragment: 'job-search-card__link' }) ||
    extractHrefByClassFragment({ block, classFragment: 'base-card__link' });

  return {
    agoTime:
      extractTextByClassFragment({ block, classFragment: 'job-search-card__listdate' }) ||
      extractTextByClassFragment({ block, classFragment: 'job-search-card__listdate--new' }) ||
      extractTextByClassFragment({ block, classFragment: 'base-search-card__listdate' }),
    applyClicks: null,
    applyClicksText: '',
    company:
      extractTextByClassFragment({ block, classFragment: 'base-search-card__subtitle' }) ||
      extractTextByClassFragment({ block, classFragment: 'job-search-card__subtitle' }) ||
      '',
    companyLogo: extractCompanyLogo(block),
    date: timeMatch ? decodeHtml(timeMatch[1]) : '',
    description: '',
    detailLowEmphasisContentTexts: [],
    detailLowEmphasisTexts: [],
    jobUrl: toAbsoluteLinkedinUrl(jobUrl),
    location:
      extractTextByClassFragment({ block, classFragment: 'job-search-card__location' }) ||
      extractTextByClassFragment({ block, classFragment: 'base-search-card__metadata' }) ||
      '',
    optionalLowEmphasisText: '',
    position:
      extractTextByClassFragment({ block, classFragment: 'base-search-card__title' }) ||
      extractTextByClassFragment({ block, classFragment: 'job-search-card__title' }) ||
      '',
    salary: extractSalary(block),
  };
}

function extractCompanyLogo(block) {
  const delayedUrlMatch =
    block.match(/data-delayed-url="([^"]+)"/i);
  const srcMatch =
    block.match(/<img[^>]*src="([^"]+)"/i);

  return decodeHtml(delayedUrlMatch?.[1] ?? srcMatch?.[1] ?? '');
}

function extractSalary(block) {
  const directSalary =
    extractTextByClassFragment({ block, classFragment: 'job-search-card__salary-info' }) ||
    extractTextByClassFragment({ block, classFragment: 'search-card__salary-info' });
  const salaryMatch =
    block.match(/([$€£]\s?\d[\d,]*(?:\s?[-–]\s?[$€£]?\s?\d[\d,]*)?(?:\s?[kKmM])?)/i);

  return directSalary || decodeHtml(salaryMatch?.[1] ?? '');
}

function toAbsoluteLinkedinUrl(url) {
  if (!url || /^https?:\/\//i.test(url)) {
    return url || '';
  }

  return url.startsWith('/') ? `https://www.linkedin.com${url}` : url;
}

module.exports = {
  parseLinkedinJobCard,
};
