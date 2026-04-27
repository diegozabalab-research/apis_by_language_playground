'use strict';

const { normalizeText } =
  require('../shared/normalize-option-values');
const { extractAttributeValue } =
  require('./extract-html-attribute-value');
const { extractElementInnerHtml } =
  require('./extract-html-element-inner-html');

function extractElementBlocksByClassFragments({
  classFragments,
  html,
  tagName,
}) {
  const pattern =
    new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  const blocks = [];
  let match;

  while ((match = pattern.exec(html)) !== null) {
    if (!hasAllClassFragments({ block: match[0], classFragments })) {
      continue;
    }

    const block =
      extractBalancedElementAt({ html, startIndex: match.index, tagName });

    if (block) {
      blocks.push(block);
    }
  }

  return blocks;
}

function extractBalancedElementAt({
  html,
  startIndex,
  tagName,
}) {
  const tagPattern =
    new RegExp(`<(/?)${String(tagName).toLowerCase()}\\b[^>]*>`, 'gi');
  let depth = 0;
  let match;

  tagPattern.lastIndex = startIndex;

  while ((match = tagPattern.exec(html)) !== null) {
    depth += match[1] === '/' ? -1 : 1;

    if (depth === 0) {
      return html.slice(startIndex, tagPattern.lastIndex);
    }
  }

  return '';
}

function hasAllClassFragments({
  block,
  classFragments,
}) {
  const classTokens =
    normalizeText(extractAttributeValue({ attributeName: 'class', block }))
      .split(/\s+/)
      .filter(Boolean);

  return classFragments.every((fragment) =>
    classTokens.includes(normalizeText(fragment)));
}

module.exports = {
  extractAttributeValue,
  extractElementBlocksByClassFragments,
  extractElementInnerHtml,
};
