'use strict';

function extractCountFromText(value) {
  const match =
    String(value ?? '')
      .replace(/,/g, '')
      .match(/(\d+)/);

  return match ? Number.parseInt(match[1], 10) : null;
}

module.exports = {
  extractCountFromText,
};
