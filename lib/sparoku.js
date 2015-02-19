var Heroku = require('heroku-client')

const OFF = 0
const GREEN = 1
const YELLOW = 2
const RED = 3
const BLUE = 4

function Sparoku() {
  // eek, for now keeping requests in memory. can go to redis later
  this.requests = []
  this.dynos = {}
  this.heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });
}

Sparoku.prototype = {
  update: function(device) {
    var status = {}
    var self = this

    this.requests.forEach(function(req) {
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
      var color = ''
      switch(self.dynos[dyno]) {
        case 'idle':
          color = BLUE
          break;
        case 'starting':
          color = BLUE
          break;
        case 'crashed':
          color = RED
          break;
        case 'up':
          var diff = status[dyno].success - status[dyno].error
          color = (diff>0)? GREEN : RED
          break;
        // update about an unknown dyno, ignore and turn off the light
        default:
          color = OFF
      }
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
      this.requests = []
    }
  },

  refresh: function() {
    var self = this
    var url = '/apps/' + process.env.HEROKU_APP_NAME + '/dynos'
    this.heroku.get(url, function(err, dynos) {
      dynos.forEach(function(dyno) {
        var num = self.dynoNum(dyno.name)
        self.dynos[num] = dyno.state
      })
    })
  },

  process: function(log) {
    if (log.heroku && log.router  && log.dyno && log.status) {
      this.requests.push({
        dyno: this.dynoNum(log.dyno),
        status: log.status
      })
    }
  },

  dynoNum: function(dynoName) {
    return dynoName.replace(/\w+\./, "")
  }
}

module.exports = new Sparoku();
