//
// Checks time with worldclockapi and prompts if there are any discrepancies to update the system time or not.
// Must be run with sudo privileges
// ATTENTION: This script changes the system time! Use with care!
// @author: Tiago Cardoso
//

// If you want to update the hours offset to match e.g. the timezone adjust here.
// TODO: Updates on improvements to get the TZ based on Timezone name (e.g. explore timezone package)
const TZ_OFFSET = 8

let request = require('request')
let datetime = require('node-datetime')
let tz = require('timezone/loaded')
let bodyparser = require('body-parser')
let cmd = require('node-cmd')

let core = require('vermon-core-entities')
let utils = core.utils

var log = utils.setLevel('info')

log.info('Requesting utc time to worldclockapi...')

request('http://worldclockapi.com/api/json/utc/now', function (error, response, body) {
  if (error) {
    log.error(error)
  } else {
    log.info(`received response... ${body}`)

    let now = JSON.parse(body).currentDateTime
    datetime.setOffsetInHours(TZ_OFFSET)
    let dt = datetime.create(now)
    let currentDt = datetime.create()
    log.info(`Comparing current system date time ${currentDt.format('m/d/Y H:M:S')} with ${dt.format('m/d/Y H:M:S')}...`)

    if (dt != currentDt) {
      log.warn('Found discrepancy with time! will change it!...')
      cmd.get(`date -s "${dt.format('m/d/Y H:M:S')}"`
        ,
        function (err, data, stderr) {
          if (err || stderr) {
            log.error(err, stderr)
          } else {
            log.info(data)
          }
        }
      )
    }
  }
})
