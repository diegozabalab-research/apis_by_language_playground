'use strict';

const { decodeHtml } =
  require('../shared/decode-html');
const { extractCountFromText } =
  require('../shared/extract-count-from-text');

function parseApplyClicksFromHtml(html) {
  const patterns = [
    /<(span|figcaption)[^>]*class="[^"]*num-applicants__caption[^"]*"[^>]*>([\s\S]*?)<\/\1>/i,
    /<(span|figcaption|div|p)[^>]*>([\s\S]{0,120}?\b(?:Be among the first \d+ applicants|\d[\d,]* applicants)\b[\s\S]{0,120}?)<\/\1>/i,
  ];

  for (const pattern of patterns) {
    const match =
      html.match(pattern);

    if (!match) {
      continue;
    }

    const applyClicksText =
      decodeHtml(match[2]);

    return {
      applyClicks: extractCountFromText(applyClicksText),
      applyClicksText,
    };
  }

  return {
    applyClicks: null,
    applyClicksText: '',
  };
}

function isStillActiveFromHtml(html) {
  return !/<figcaption[^>]*class="[^"]*closed-job__flavor--closed[^"]*"[^>]*>\s*No longer accepting applications\s*<\/figcaption>/i.test(html);
}

function parseJobPostingHtml({
  givenUrl,
  html,
  queriedUrl,
}) {
  return {
    ...parseApplyClicksFromHtml(html),
    givenUrl,
    queriedUrl,
    stillActive: isStillActiveFromHtml(html),
  };
}

module.exports = {
  isStillActiveFromHtml,
  parseApplyClicksFromHtml,
  parseJobPostingHtml,
};
