'use strict'

const plugins = [
  {
    plugin: require("./plugins/users"),
    routes: {
      prefix: "/user"
    }
  },
  {
    plugin: require("./plugins/products"),
    routes: {
      prefix: "/product"
    }
  }
]

module.exports = async (server) => {
  await server.register(plugins);
}