var express = require('express');
var logfmt  = require('logfmt');
var spark   = require('spark')
var sparoku = require('./lib/sparoku.js')

// get the spark device
var device = null;
spark.login({ accessToken: process.env.SPARK_TOKEN });
spark.getDevice(process.env.SPARK_DEVICE_ID, function(err, d) {
  device = d;
})

// schedule device update with dyno summaries
setInterval(function() {
  sparoku.update(device)
}, 1000)

// schedule a refresh on heroku processes
setInterval(function() {
  sparoku.refresh()
}, 1000)

// setup Express app to handle the logs
var app = express();
app.set('port', (process.env.PORT || 5000));
app.use(logfmt.bodyParser());

app.post('/logs', function(req, res) {
  req.body.forEach(function(log) {
    sparoku.process(log)
  })
  res.status(200).end()
});

app.listen(app.get('port'), function() {
  console.log("Sparoku drain running in port " + app.get('port'));
});
