'use strict';

const { decodeHtml } =
  require('../shared/decode-html');
const {
  extractElementBlocksByClassFragments,
  extractElementInnerHtml,
} = require('./extract-html-elements-by-class');

function extractLinkedinDetailLowEmphasisTexts(html) {
  const lowEmphasisTexts =
    extractCurrentLowEmphasisTexts(html);

  return lowEmphasisTexts.length > 0
    ? lowEmphasisTexts
    : extractLegacyLowEmphasisTexts(html);
}

function extractCurrentLowEmphasisTexts(html) {
  const blocks =
    extractElementBlocksByClassFragments({
      classFragments: ['job-details-jobs-unified-top-card__tertiary-description-container'],
      html,
      tagName: 'div',
    });
  const texts = [];

  for (const block of blocks) {
    collectLowEmphasisSpanTexts({ block, texts });
  }

  return texts;
}

function collectLowEmphasisSpanTexts({
  block,
  texts,
}) {
  const spanBlocks =
    extractElementBlocksByClassFragments({
      classFragments: ['tvm__text', 'tvm__text--low-emphasis'],
      html: block,
      tagName: 'span',
    });

  for (const spanBlock of spanBlocks) {
    const text =
      decodeHtml(extractElementInnerHtml({ block: spanBlock }));

    if (text) {
      texts.push(text);
    }
  }
}

function extractLegacyLowEmphasisTexts(html) {
  const blocks =
    extractElementBlocksByClassFragments({
      classFragments: ['top-card-layout__second-subline'],
      html,
      tagName: 'h4',
    });
  const texts = [];

  for (const block of blocks) {
    collectLegacyCandidateTexts({ block, texts });
  }

  return texts;
}

function collectLegacyCandidateTexts({
  block,
  texts,
}) {
  const candidates = [
    ['span', ['topcard__flavor', 'topcard__flavor--bullet']],
    ['span', ['posted-time-ago__text', 'topcard__flavor--metadata']],
    ['span', ['num-applicants__caption']],
    ['figcaption', ['num-applicants__caption']],
  ];

  for (const [tagName, classFragments] of candidates) {
    const blocks =
      extractElementBlocksByClassFragments({ classFragments, html: block, tagName });

    for (const candidateBlock of blocks) {
      const text =
        decodeHtml(extractElementInnerHtml({ block: candidateBlock }));

      if (text) {
        texts.push(text);
      }
    }
  }
}

module.exports = {
  extractLinkedinDetailLowEmphasisTexts,
};
