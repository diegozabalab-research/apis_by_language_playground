'use strict';

const { decodeHtml } =
  require('../shared/decode-html');

function extractAttributeValue({
  attributeName,
  block,
}) {
  const doubleQuotedMatch =
    block.match(new RegExp(`${attributeName}="([^"]+)"`, 'i'));
  const singleQuotedMatch =
    block.match(new RegExp(`${attributeName}='([^']+)'`, 'i'));

  return decodeHtml(doubleQuotedMatch?.[1] ?? singleQuotedMatch?.[1] ?? '');
}

module.exports = {
  extractAttributeValue,
};
