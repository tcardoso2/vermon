#!/bin/bash

mocha test/internal-command-specs.js --testcli &&
mocha test/internal-config-specs.js &&
mocha test/internal-detector-specs.js &&
mocha test/internal-extension-specs.js &&
mocha test/internal-filter-specs.js &&
mocha test/internal-multi-environment-specs.js &&
mocha test/internal-notifier-specs.js &&
mocha test/internal-pir-detector-specs.js &&
#mocha test/internal-raspistill-notifier-specs.js &&
#mocha test/internal-setup-specs.js &&
mocha test/internal-slack-notifier-specs.js --exit

