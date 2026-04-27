'use strict';

function parseCliArgumentValue({
  args,
  index,
}) {
  if (index + 1 >= args.length) {
    throw new Error(`Missing value for ${args[index]}`);
  }

  return args[index + 1];
}

module.exports = {
  parseCliArgumentValue,
};
