'use strict';

const fs =
  require('node:fs');
const path =
  require('node:path');

function readLinkedinJobsFixture(fileName) {
  return fs.readFileSync(
    path.join(__dirname, 'fixtures', fileName),
    'utf8',
  );
}

module.exports = {
  readLinkedinJobsFixture,
};
