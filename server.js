var express = require('express');
var logfmt  = require('logfmt');
var spark   = require('spark')
var sparoku = require('./lib/sparoku.js')

var device = null;
spark.login({ accessToken: process.env.SPARK_TOKEN });
spark.getDevice(process.env.SPARK_DEVICE_ID, function(err, d) {
  device = d;
})

var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(logfmt.bodyParser());

var requests = []

// every second: update device with dyno summaries
setInterval(function() {
  sparoku.update(requests, device)
}, 1000)

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
