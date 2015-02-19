var Heroku = require('heroku-client')

if (!process.env.HEROKU_API_TOKEN) {
  console.error("Missing HEROKU_API_TOKEN")
  process.abort
}
if (!process.env.HEROKU_APP_NAME) {
  console.error("Missing HEROKU_APP_NAME")
  process.abort
}
if (!process.env.DRAIN_APP_NAME) {
  console.error("Missing DRAIN_APP_NAME")
  process.abort
}

var heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN })
var drainUrl = 'https://' + process.env.DRAIN_APP_NAME + '.herokuapp.com/logs'

var url = '/apps/' + process.env.HEROKU_APP_NAME + '/log-drains'
var payload = { url: drainUrl }

heroku.post(url, payload, function(err, drain) {
  if (err && err.statusCode == 422) {
    console.log('Drain already exists')
  }
  else if (err) {
    console.error('Could not create drain:')
    console.error(err)
  }
  else {
    console.log('Drain created')
  }
})