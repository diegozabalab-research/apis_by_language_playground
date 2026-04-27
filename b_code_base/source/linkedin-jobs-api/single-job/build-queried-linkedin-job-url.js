'use strict';

function buildQueriedJobUrl(inputUrl) {
  const parsedUrl =
    new URL(inputUrl);

  if (isGuestJobPostingUrl(parsedUrl)) {
    return parsedUrl.toString();
  }

  return `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${extractJobIdFromUrl(inputUrl)}`;
}

function extractJobIdFromUrl(inputUrl) {
  const parsedUrl =
    new URL(inputUrl);
  const pathnameMatch =
    parsedUrl.pathname.match(/\/jobs\/view\/(?:[^/?#]*-)?(\d+)/i);
  const genericMatch =
    parsedUrl.href.match(/(\d{7,})/);

  if (pathnameMatch) {
    return pathnameMatch[1];
  }

  if (genericMatch) {
    return genericMatch[1];
  }

  throw new Error(`Unable to extract LinkedIn job ID from URL: ${inputUrl}`);
}

function isGuestJobPostingUrl(parsedUrl) {
  return (
    parsedUrl.hostname === 'www.linkedin.com' &&
    /^\/jobs-guest\/jobs\/api\/jobPosting\/\d+$/i.test(parsedUrl.pathname)
  );
}

module.exports = {
  buildQueriedJobUrl,
  extractJobIdFromUrl,
};
