const OFF = 0
const GREEN = 1
const YELLOW = 2
const RED = 3

function Sparoku() {
}

Sparoku.prototype = {
  update: function(requests, device) {
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

    if (update.length > 0 && device) {
      var rawUpdate = update.reduce(function(prev, update) {
        return prev + ';' + update
      }) + ';'

      device.callFunction('update', rawUpdate, function(err, data) {
        if (err) {
          console.log('device update failed:')
          console.log(err)
        }
        else {
          console.log('device update ok:')
          console.log(data)
        }
      });
      console.log(rawUpdate)
      requests.length = 0
    }
  }
}

module.exports = new Sparoku();
