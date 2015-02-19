# Sparoku Drain

This is a Heroku log drain that connects to a Spark Core device running [Sparoku Status](https://github.com/heroku/sparoku-status) to render a visualization of how your dynos are doing.


## Setup

Start setting up your device following the [Sparoku Status instructions](https://github.com/heroku/sparoku-status).

Once the device is ready deploy your drain:

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/heroku/sparoku-drain)


## Running locally

```bash
$ npm install
$ cp .env.sample .env
```

You can then boot the server locally with `foreman start`, and make requests immitating the Heroku router, like:

```bash
$ curl -d "heroku router dyno=web.1 status=500" -H "Content-Type: application/logplex-1" http://localhost:5000/logs
```

This should make the first light on the device turn red.
