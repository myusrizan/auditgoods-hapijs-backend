'use strict';

const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Blipp = require('blipp');
const HapiJWT2 = require('hapi-auth-jwt2');
const app = require('./app.json');

let swaggerOptions = {
  info: {
    title: 'Mobcom API Documentation',
    description: 'MOBCOM'
  },
  securityDefinitions: {
    jwt: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  },
  security: [{ jwt: [] }]
};

const validate = async function(decoded, request) {
  if(decoded._id && decoded.fullName) {
    return { isValid: true, scope: decoded.role }
  }
  else {
    return { isValid: false }
  }
}

const Plugins = async (server) => {
  await server.register([
    Inert,
    Vision,
    Blipp,
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    },
    HapiJWT2
  ]);

  server.auth.strategy('jwt', 'jwt', 
    {
      key: app.JWT_Key,
      validate: validate,
      verifyOptions: {
        ignoreExpiration: true,
        algorithms: ['HS256'],
        tokenType: 'Bearer'
      }
    }
  );

  server.auth.default('jwt');
}

module.exports = (server) => Plugins(server);