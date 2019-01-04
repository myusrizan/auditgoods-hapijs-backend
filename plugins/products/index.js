'use strict'

const plugin = {
  name: 'products',
  version: "1.0.0",
  register: async function(server, options) {
    const routes = require('./routes');

    await server.route(
      routes
    )
  }
}

module.exports = plugin;