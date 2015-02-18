var express = require('express');
var app = express();
var logfmt = require('logfmt');

app.set('port', (process.env.PORT || 5000));

app.use(logfmt.bodyParser());

app.post('/logs', function(req, res) {
  req.body.forEach(function(log) {
    if (log.heroku && log.router  && log.dyno && log.status) {
      var dyno = log.dyno.replace(/\w+\./, "")
      console.log("dyno " + dyno + " status=" + log.status)
    }
  })
  res.status(200).end()
});

app.listen(app.get('port'), function() {
  console.log("Sparoku drain running in port " + app.get('port'));
});
