'use strict';

function sleepForMilliseconds(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

module.exports = {
  sleepForMilliseconds,
};
