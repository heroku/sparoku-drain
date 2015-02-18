var express = require('express');
var app = express();
var logfmt = require('logfmt');

app.set('port', (process.env.PORT || 5000));

app.use(logfmt.bodyParser());

app.post('/logs', function(req, res) {
  console.log('received log:')
  console.log(req.body)
  res.status(200).end()
});

app.listen(app.get('port'), function() {
  console.log("Sparoku drain running in port " + app.get('port'));
});
