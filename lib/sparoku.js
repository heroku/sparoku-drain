var Heroku = require('heroku-client')

function Sparoku() {
  // eek, for now keeping requests in memory. can go to redis later
  this.requests = []
  this.dynos = {}
  this.heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });
  this.colors = {
    off: 0,
    green: 1,
    yellow: 2,
    red: 3,
    blue: 4
  }
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

    console.log('----')
    console.log(self.dynos)
    console.log(status)

    var update = Object.keys(self.dynos).map(function(dyno) {
      var color = self.getColor(dyno, status[dyno])
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
  },

  getColor: function(dyno, status) {
    switch(this.dynos[dyno]) {
      case 'idle':
        return this.colors.blue
      case 'starting':
        return this.colors.blue
      case 'crashed':
        return this.colors.red
      case 'up':
        var diff = status.success - status.error
        return (diff>0)? this.colors.green : this.colors.red
      // update about an unknown dyno, ignore and turn off the light
      default:
        return this.colors.off
    }
  }
}

module.exports = new Sparoku();
