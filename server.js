'use strict';

const Hapi = require('Hapi');
const db = require('./database').db;

const server = new Hapi.Server({
  host: 'localhost',
  port: 8000,
  routes: {
    cors: {
      origin: ['http://localhost:3000']
    }
  }
});

async function start() {
  try {
    await require('./server-addons')(server);

    await require('./server-plugins')(server);

    await server.start();
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }
  console.log('Server running at:', server.info.uri);
};

start();