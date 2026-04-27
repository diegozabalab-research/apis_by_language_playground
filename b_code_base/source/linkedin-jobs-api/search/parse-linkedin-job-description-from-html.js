'use strict';

const { decodeHtml } =
  require('../shared/decode-html');

function parseJobDescriptionFromHtml(html) {
  const patterns = [
    /<div[^>]*class="[^"]*feed-shared-inline-show-more-text[^"]*text-body-small-open[^"]*"[^>]*>[\s\S]*?<\/div>/i,
    /<div[^>]*class="[^"]*show-more-less-html__markup[^"]*"[^>]*>[\s\S]*?<\/div>/i,
  ];

  for (const pattern of patterns) {
    const block =
      html.match(pattern)?.[0];

    if (!block) {
      continue;
    }

    const description =
      decodeHtml(block.replace(/^[\s\S]*?>/, '').replace(/<\/div>\s*$/i, ''));

    if (description) {
      return description;
    }
  }

  return '';
}

module.exports = {
  parseJobDescriptionFromHtml,
};
