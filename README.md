# Sparoku Drain

This is a Heroku log drain that connects to a Spark Core device running [Sparoku Status](https://github.com/heroku/sparoku-status) to render a visualization of how the app dynos are doing.

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy?template=https://github.com/heroku/sparoku-drain)

## Setup

```bash
$ npm install
$ cp .env.sample .env
```

## Running locally

Boot the server with `foreman start`, then make requests immitating the Heroku router, like:

```bash
$ curl -d "heroku router dyno=web.1 status=500" -H "Content-Type: application/logplex-1" http://localhost:5000/logs
```

This should make the first light on the device turn red.
