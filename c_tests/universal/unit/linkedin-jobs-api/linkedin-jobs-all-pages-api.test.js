'use strict';

const test =
  require('node:test');
const assert =
  require('node:assert/strict');

const {
  buildWrapperOptions,
  queryAll,
} = require('../../../../b_code_base/source/linkedin-jobs-api/all-pages/linkedin-jobs-all-pages-api');

test('buildWrapperOptions keeps compatibility aliases and resets the start offset', () => {
  const options =
    buildWrapperOptions({
      maxResults: '3',
      pretty: 'true',
      showUrl: 'yes',
      start: '44',
    });

  assert.equal(options.maxEntries, 3);
  assert.equal(options.pretty, true);
  assert.equal(options.showUrl, true);
  assert.equal(options.start, 0);
});

test('queryAll requests one result at a time until the first empty page', async () => {
  const requestedStarts = [];
  const jobs =
    await queryAll({
      maxEntries: 5,
      queryImpl: async ({ start }) => {
        requestedStarts.push(start);

        return start < 3 ? [{ jobUrl: `https://example.com/${start}` }] : [];
      },
      sleep: async () => undefined,
    });

  assert.deepEqual(requestedStarts, [0, 1, 2, 3]);
  assert.deepEqual(
    jobs.map((job) => job.jobUrl),
    ['https://example.com/0', 'https://example.com/1', 'https://example.com/2'],
  );
});
