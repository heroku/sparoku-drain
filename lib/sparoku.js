var Heroku = require('heroku-client')

function Sparoku() {
  // eek, for now keeping requests in memory. can go to redis later
  this.requests = []
  this.dynos = []
  this.heroku = new Heroku({ token: process.env.HEROKU_API_TOKEN });
  this.states = {
    down: 0,
    up: 1,
    serving: 2,
    error: 3,
    crashed: 4,
    booting: 5,
    idle: 6
  }
  this.lastUpdate = ''
  this.lastUpdateAt = Date.now()
}

Sparoku.prototype = {
  update: function(device) {
    var self = this
    var status = this.requestsSummary();

    var i = 1;
    var update = self.dynos.map(function(state) {
      return self.getState(state, status[i++])
    })

    this.updateDevice(device, update);
  },

  refresh: function() {
    var self = this
    var url = '/apps/' + process.env.HEROKU_APP_NAME + '/dynos'
    this.heroku.get(url, function(err, dynos) {
      if (err) {
        console.error(err)
        return
      }
      var updated = {}
      var max = 0;
      dynos.forEach(function(dyno) {
        var num = self.dynoNum(dyno.name)
        self.dynos[num-1] = dyno.state
        if (max < num) max = num;
      })

      // remove dynos that were not listed
      for(var i=max; i<self.dynos.length; i++) {
        self.dynos[i] = 'scaled_down';
      }
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

  processDeviceReturn: function(returnValue) {
    switch(returnValue) {
      case 2:
        this.scaleApp('+1');
        break;
      case 3:
        this.scaleApp('-1');
        break;
      case 4:
        this.restartApp();
        break;
    }
  },

  requestsSummary: function() {
    var status = {}
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
    return status;
  },

  scaleApp: function(delta) {
    var url = '/apps/' + process.env.HEROKU_APP_NAME + '/formation/web'
    var payload = { quantity: delta }
    this.heroku.patch(url, payload, function(err, dynos) {
      if (err) {
        console.log('scale failed:')
        console.log(err)
      }
      else {
        console.log('app scaled to ' + delta)
      }
    });
  },

  restartApp: function() {
    var url = '/apps/' + process.env.HEROKU_APP_NAME + '/dynos'
    this.heroku.delete(url, function(err, dynos) {
      if (err) {
        console.log('restart failed:')
        console.log(err)
      }
      else {
        console.log('app restarted')
      }
    });
  },

  updateDevice: function(device, update) {
    if (!device || update.length == 0) return;

    var self = this;
    var rawUpdate = update.reduce(function(prev, update) {
      return prev.toString().concat(update)
    })

    // always update after 10s
    diff = Date.now() - self.lastUpdateAt;
    if (rawUpdate != self.lastUpdate || diff > 10000) {
      self.lastUpdateAt = Date.now()
      self.lastUpdate = rawUpdate
      device.callFunction('update', rawUpdate, function(err, data) {
        if (err) {
          console.log('device update failed:')
          console.log(err)
        }
        else {
          self.processDeviceReturn(data.return_value);
        }
      });
      console.log(rawUpdate)
    }
    this.requests = []
  },

  dynoNum: function(dynoName) {
    return dynoName.replace(/\w+\./, "")
  },

  getState: function(dynoState, requestSummary) {
    switch(dynoState) {
      case 'idle':
        return this.states.idle
      case 'starting':
      case 'restarting':
        return this.states.booting
      case 'crashed':
        return this.states.crashed
      case 'up':
        if (!requestSummary) return this.states.up
        var diff = requestSummary.success - requestSummary.error
        return (diff>0)? this.states.serving : this.states.error
      // update about an unknown dyno, ignore and turn off the light
      default:
        return this.states.down
    }
  }
}

module.exports = new Sparoku();
