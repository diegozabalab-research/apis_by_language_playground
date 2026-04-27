'use strict';

const { decodeHtml } =
  require('../shared/decode-html');

function extractHrefByClassFragment({
  block,
  classFragment,
}) {
  const match =
    block.match(
      new RegExp(
        `<a[^>]*class="[^"]*${classFragment}[^"]*"[^>]*href="([^"]+)"`,
        'i',
      ),
    );

  return match ? decodeHtml(match[1]) : '';
}

function extractTextByClassFragment({
  block,
  classFragment,
}) {
  const match =
    block.match(
      new RegExp(
        `<[^>]*class="[^"]*${classFragment}[^"]*"[^>]*>([\\s\\S]*?)<\\/[^>]+>`,
        'i',
      ),
    );

  return match ? decodeHtml(match[1]) : '';
}

module.exports = {
  extractHrefByClassFragment,
  extractTextByClassFragment,
};
