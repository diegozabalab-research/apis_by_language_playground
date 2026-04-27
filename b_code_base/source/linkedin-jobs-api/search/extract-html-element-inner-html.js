'use strict';

function extractElementInnerHtml({
  block,
}) {
  const tagEndIndex =
    findTagEndIndex({
      html: block,
      startIndex: 0,
    });
  const closingTagIndex =
    block.lastIndexOf('</');

  if (tagEndIndex === -1 || closingTagIndex <= tagEndIndex) {
    return '';
  }

  return block.slice(tagEndIndex + 1, closingTagIndex);
}

function findTagEndIndex({
  html,
  startIndex,
}) {
  let inDoubleQuote = false;
  let inSingleQuote = false;

  for (let index = startIndex; index < html.length; index += 1) {
    const character =
      html[index];

    inSingleQuote =
      character === "'" && !inDoubleQuote ? !inSingleQuote : inSingleQuote;
    inDoubleQuote =
      character === '"' && !inSingleQuote ? !inDoubleQuote : inDoubleQuote;

    if (character === '>' && !inDoubleQuote && !inSingleQuote) {
      return index;
    }
  }

  return -1;
}

module.exports = {
  extractElementInnerHtml,
};
