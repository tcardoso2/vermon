#!/bin/bash

export MOCHA_BADGE_SUBJECT=mocha
export MOCHA_BADGE_OK_COLOR=green
export MOCHA_BADGE_KO_COLOR=orange
export MOCHA_BADGE_STYLE=flat

#Reporter
mocha --exit test/internal-command-specs.js test/internal-config-specs.js test/internal-detector-specs.js test/internal-extension-specs.js test/internal-filter-specs.js test/internal-multi-environment-specs.js test/internal-notifier-specs.js test/internal-pir-detector-specs.js test/internal-slack-notifier-specs.js --reporter mocha-reporter-badge | sed -n -e '/<svg/,$p' > badge.svg

#sed -n -e '/<svg/,$p' badge.svg > badge.out
