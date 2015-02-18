var express = require('express');
var app = express();
var concat = require('concat-stream');

app.set('port', (process.env.PORT || 5000));

// custom middleware to store raw request bodies
// can't use body-parser because it's very sensitive to content-types
app.use(function(req, res, next){
  req.pipe(concat(function(data){
    req.body = data;
    next();
  }));
});

app.post('/logs', function(req, res) {
  var raw = Buffer(req.body).toString('utf8')
  console.log('received log:')
  console.log(raw)
  res.status(200).end()
});

app.listen(app.get('port'), function() {
  console.log("Sparoku drain running in port " + app.get('port'));
});
