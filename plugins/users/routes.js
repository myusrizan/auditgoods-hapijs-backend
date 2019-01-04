'use strict'

const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const User = require('./model/User');
const Boom = require('boom');
const jwt = require('jsonwebtoken');
const app = require('./../../app.json');

const validate = (type) => {
  let result = {};

  switch(type) {
    case 'register':
      result.payload = {
        username: Joi.string().required().trim(),
        password: Joi.string().required().trim().min(4),
        fullName: Joi.string().required().required().trim(),
        role: Joi.string().required().trim()
      }
    break;
    case 'login':
      result.payload = {
        username: Joi.string().required().trim(),
        password: Joi.string().required().trim().min(4),
      }
    break;
    case 'delete':
      result.params = {
        userId: Joi.objectId().required()
      }
    break;
    case 'update':
      result.params = {
        userId: Joi.objectId().required()
      },
      result.payload = {
        username: Joi.string().required().trim(),
        password: Joi.string().required().trim().min(4),
        fullName: Joi.string().required().required().trim(),
        role: Joi.string().required().trim()
      }
    break;
    case 'id':
      result.params = {
        userId: Joi.objectId().required()
      }
    break;
  }

  return result;
}

const findSize = (obj) => {
  let size = 0, key;
  for(key in obj) {
    if(obj.hasOwnProperty(key)) {
      size++;
    }
  }

  return size;
};

module.exports = [
  {
    method: 'POST',
    path: '/register',
    options: {
      handler: async function(request, res) {
        let { username } = request.payload;

        const checkUser = await User.findOne({ username }).exec();

        if(checkUser) {
          throw Boom.badRequest('Username is already exist');
        }

        const createUser = await User.create(request.payload);

        return res.response({
          status: 'success',
          data: createUser.toJSON()
        })
      },
      tags: ['api'],
      validate: validate('register'),
    }
  },
  {
    method: 'POST',
    path: '/login',
    options: {
      auth: false,
      handler: async function(request, res) {
        let { username, password } = request.payload;
        
        const checkUser = await User.findOne({
          username: username,
          password: password
        }).exec();

        if(!checkUser) {
          throw Boom.notFound("username or password is invalid");
        }

        const token = await jwt.sign(checkUser.toJSON(), app.JWT_Key);

        const data = {
          token,
          ...checkUser._doc
        }

        return res.response({
          status: "success",
          data
        });
      },
      tags: ['api'],
      validate: validate('login')
    }
  },
  {
    method: 'GET',
    path: '/',
    options: {
      handler: async function(request, res) {
        const result = await User.find().exec();

        return res.response({
          status: "success",
          size: findSize(result),
          result
        })
      },
      tags: ['api'],
    }
  },
  {
    method: 'DELETE',
    path: '/delete/{userId}',
    options: {
      handler: async function(request, res) {
        const { userId } = request.params;
        const checkUser = await User.findById(userId).exec();

        if(!checkUser) {
          throw Boom.notFound("User not found");
        }
        
        await User.remove({_id: userId});

        return res.response({
          status: "success"
        })
      },
      tags: ['api'],
      validate: validate('delete')
    }
  },
  {
    method: 'PUT',
    path: '/update/{userId}',
    options: {
      handler: async function(request, res) {
        const { userId } = request.params;

        const checkUser = await User.findById(userId).exec();

        if(!checkUser) {
          throw Boom.notFound("User not found");
        }

        await User.findByIdAndUpdate(userId, request.payload).exec();
        const result = User.findById(userId).exec();

        return res.response({
          status: "success",
          result
        });
      },
      tags: ['api'],
      validate: validate('update')
    }
  },
  {
    method: 'GET',
    path: '/{userId}',
    options: {
      handler: async function(request, res) {
        const { userId } = request.params;

        const checkUser = await User.findById(userId).exec();

        if(!checkUser) {
          throw Boom.notFound("User not found");
        }

        return res.response({
          status: "success",
          result: checkUser
        });
      },
      tags: ['api'],
      validate: validate('id')
    }
  }
]