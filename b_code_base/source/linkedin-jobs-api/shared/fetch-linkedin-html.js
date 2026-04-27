'use strict';

const {
  LINKEDIN_REQUEST_HEADERS,
} = require('../constants/linkedin-request-headers');

async function fetchLinkedinHtml(url) {
  const response =
    await fetch(url, {
      headers: LINKEDIN_REQUEST_HEADERS,
    });

  if (!response.ok) {
    throw new Error(
      `LinkedIn request failed with ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

module.exports = {
  fetchLinkedinHtml,
};
