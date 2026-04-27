'use strict';

const { parseCliArgumentValue } =
  require('../shared/parse-cli-argument-value');

function parseCliArgs(argv) {
  const args =
    argv.slice(2);
  const options = {};

  for (let index = 0; index < args.length; index += 1) {
    const argument =
      args[index];

    if (argument === '--help' || argument === '-h') {
      options.help = true;
      continue;
    }

    if (argument === '--pretty') {
      options.pretty = true;
      continue;
    }

    if (argument === '--jobUrl' || argument === '--job-url') {
      options.jobUrl =
        parseCliArgumentValue({ args, index });
      index += 1;
      continue;
    }

    if (!argument.startsWith('-') && !options.jobUrl) {
      options.jobUrl = argument;
      continue;
    }

    throw new Error(`Unknown argument: ${argument}`);
  }

  return options;
}

module.exports = {
  parseCliArgs,
};
