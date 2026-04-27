'use strict';

const { parseLinkedinJobCard } =
  require('./parse-linkedin-job-card');

function parseJobsFromHtml(html) {
  const jobBlocks =
    html.match(/<li\b[\s\S]*?<div[^>]*class="[^"]*base-card[^"]*"[\s\S]*?<\/li>/gi) ||
    html.match(/<div[^>]*class="[^"]*base-card[^"]*"[\s\S]*?<\/div>\s*<\/li>/gi) ||
    [];
  const jobs = [];
  const seenUrls =
    new Set();

  for (const block of jobBlocks) {
    const job =
      parseLinkedinJobCard(block);

    if (!job.position || !job.company || !job.jobUrl) {
      continue;
    }

    if (seenUrls.has(job.jobUrl)) {
      continue;
    }

    seenUrls.add(job.jobUrl);
    jobs.push(job);
  }

  return jobs;
}

module.exports = {
  parseJobsFromHtml,
};
