var express = require('express');
var app = express();
var logfmt = require('logfmt');
var spark = require('spark')

var device = null;
spark.login({ accessToken: process.env.SPARK_TOKEN });
spark.getDevice(process.env.SPARK_DEVICE_ID, function(err, d) {
  device = d;
})

const OFF = 0;
const GREEN = 1;
const YELLOW = 2;
const RED = 3;

app.set('port', (process.env.PORT || 5000));
app.use(logfmt.bodyParser());

var dynos = {}
var requests = []

// every 2s: update based on traffic
setInterval(function() {
  var status = {}

  requests.forEach(function(req) {
    if (!status[req.dyno]) {
      status[req.dyno] = { success: 0, error: 0 }
    }
    if (parseInt(req.status) >= 500) {
      status[req.dyno].error += 1
    }
    else {
      status[req.dyno].success += 1
    }
  })

  var update = Object.keys(status).map(function(dyno) {
    var diff = status[dyno].success - status[dyno].error
    var color = (diff>0)? GREEN : RED
    return dyno + '=' + color
  })

  var rawUpdate = update.reduce(function(prev, update) {
    return prev + ';' + update
  }) + ';'

  console.log(rawUpdate)

}, 1000)

// to test:
// setInterval(function() {
//   requests.push({ dyno: 1, status: 200 })
//   requests.push({ dyno: 2, status: 500 })
// }, 100)

app.post('/logs', function(req, res) {
  req.body.forEach(function(log) {
    if (log.heroku && log.router  && log.dyno && log.status) {
      var dyno = log.dyno.replace(/\w+\./, "")
      requests.push({ dyno: dyno, status: log.status })
    }
  })
  res.status(200).end()
});

app.listen(app.get('port'), function() {
  console.log("Sparoku drain running in port " + app.get('port'));
});
