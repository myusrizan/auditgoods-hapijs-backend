'use strict'

const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const Product = require('./model/Product');
const LogSell = require('./model/LogSell');
const LogReport = require('./model/LogReport');
const LogRestock = require('./model/LogRestock');
const Boom = require('boom');
const jwt = require('jsonwebtoken');
const app = require('./../../app.json');

const validate = (type) => {
  let result = {};

  switch(type) {
    case 'create':
      result.payload = {
        name: Joi.string().required(),
        distributor: Joi.string(),
        hargaModal: Joi.number().min(0).required(),
        hargaJual: Joi.number().min(0).required(),
        stok: Joi.number().min(0)
      }
    break;
    case 'update':
      result.params = {
        productId: Joi.objectId()
      }
      result.payload = {
        name: Joi.string().required(),
        distributor: Joi.string(),
        hargaModal: Joi.number().min(0).required(),
        hargaJual: Joi.number().min(0).required(),
        stok: Joi.number().min(0)
      }
    break;
    case 'productId':
      result.params = {
        productId: Joi.objectId()
      }
    break;
    case 'delete':
      result.params = {
        productId: Joi.objectId().required()
      }
    break;
    case 'sell':
      result.params = {
        productId: Joi.objectId().required()
      },
      result.payload = {
        clientName: Joi.string().trim().required(),
        qty: Joi.number().min(1).required(),
        hargaPerItem: Joi.number().required().min(0)
      }
    break;
    case 'restock':
      result.params = {
        productId: Joi.objectId().required()
      },
      result.payload = {
        qty: Joi.number().min(1).required()
      }
    break;
    case 'restockValidation':
      result.params = {
        logRestockId: Joi.objectId().required()
      },
      result.payload = {
        status: Joi.string().required()
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
    path: '/create',
    options: {
      handler: async function(request, res) {
        const { hargaJual, hargaModal } = request.payload;

        if(hargaJual < hargaModal) {
          throw Boom.badData("Harga Jual is little than Harga Modal");
        }

        const result = await Product.create(request.payload);

        return res.response({
          status: 'success',
          result: result.toJSON()
        })
      },
      tags: ['api'],
      validate: validate('create'),
      auth: false
    }
  },
  {
    method: 'DELETE',
    path: '/delete/{productId}',
    options: {
      handler: async function(request, res) {
        const { productId } = request.params;
        const checkProduct = await Product.findById(productId).exec();

        if(!checkProduct) {
          throw Boom.notFound("Product not found");
        }

        await Product.remove({_id: productId});

        return res.response({
          status: "success"
        })
      },
      tags: ['api'],
      validate: validate('delete'),
      auth: false
    }
  },
  {
    method: 'PUT',
    path: '/update/{productId}',
    options: {
      handler: async function(request, res) {
        const { productId } = request.params;

        const checkProduct = await Product.findById(productId).exec();

        if(!checkProduct) {
          throw Boom.notFound("Product not found");
        }

        await Product.findByIdAndUpdate(productId, request.payload).exec();
        const result = await Product.findById(productId).exec();

        return res.response({
          status: "success",
          result: result.toJSON()
        });
      },
      tags: ['api'],
      validate: validate('update')
    }
  },
  {
    method: 'GET',
    path: '/{productId}',
    options: {
      handler: async function(request, res) {
        const { productId } = request.params;

        const checkProduct = await Product.findById(productId).exec();

        if(!checkProduct) {
          throw Boom.notFound("Product not found");
        }

        return res.response({
          status: "success",
          data: checkProduct.toJSON()
        });
      },
      tags: ['api'],
      validate: validate('productId')
    }
  },
  {
    method: 'POST',
    path: '/sell/{productId}',
    options: {
      handler: async function(request, res) {
        const { productId } = request.params;
        const { clientName, qty, hargaPerItem } = request.payload;

        if(request.auth.credentials.role === "sales") {
          const checkProduct = await Product.findById(productId).exec();

          if(!checkProduct) {
            throw Boom.notFound("Product not found");
          }
          else if((checkProduct.stok - qty) < 0) {
            throw Boom.badData("Qty is minus");
          }
          else {
            const resultLogSell = await LogSell.create({
              clientName,
              product: productId,
              qty,
              hargaPerItem,
              hargaTotal: qty * hargaPerItem,
              tglBeli: Date.now()
            });

            await LogReport.create({
              logSell: resultLogSell._id,
              sales: request.auth.credentials._id,
              tglLog: Date.now()
            });

            await Product.findByIdAndUpdate(productId, {stok: checkProduct.stok - qty}).exec();
            const resultUpdateProduct = await Product.findById(productId).exec();

            return res.response({
              status: "success",
              data: resultUpdateProduct
            })
          }
        }
        else {
          throw Boom.forbidden("You are not a sales");
        }
      },
      tags: ['api'],
      validate: validate('sell')
    }
  },
  {
    method: 'POST',
    path: '/restock/{productId}',
    options: {
      handler: async function(request, res) {
        const { productId } = request.params;
        const { qty } = request.payload;

        if(request.auth.credentials.role === "gudang") {
          const checkProduct = await Product.findById(productId).exec();

          if(!checkProduct) {
            throw Boom.notFound("Product not found");
          }
          
          const result = await LogRestock.create({
            product: productId,
            qty,
            gudang: request.auth.credentials._id,
            tgl: Date.now()
          });

          return res.response({
            status: "success",
            result
          });
        }
        else {
          throw Boom.forbidden("You are not a gudang");
        }
      },
      tags: ['api'],
      validate: validate('restock')
    }
  },
  {
    method: 'POST',
    path: '/restock/validation/{logRestockId}',
    options: {
      handler: async function(request, res) {
        const { logRestockId } = request.params;

        if(request.auth.credentials.role === "owner") {
          const checkLogRestock = await LogRestock.findById(logRestockId).exec();

          if(!checkLogRestock || checkLogRestock.status === "approved") {
            throw Boom.notFound("Product not found");
          }

          await LogRestock.findByIdAndUpdate(logRestockId, request.payload).exec();
          const result = await LogRestock.findById(logRestockId).populate('product').exec();
          await Product.findByIdAndUpdate(result.product, {stok: result.product.stok + result.qty});

          return res.response({
            status: "success",
            result
          });
        }
        else {
          throw Boom.forbidden("You are not an owner");
        }
      },
      tags: ['api'],
      validate: validate('restockValidation')
    }
  },
  {
    method: 'GET',
    path: '/',
    options: {
      handler: async function(request, res) {
        const result = await Product.find().exec();

        return res.response({
          status: "success",
          size: findSize(result),
          result
        });
      },
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/logrestock',
    options: {
      handler: async function(request, res) {
        const result = await LogRestock.find().populate('gudang product').exec();

        return res.response({
          status: 'success',
          size: findSize(result),
          result
        });
      },
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/logreport',
    options: {
      handler: async function(request, res) {
        const result = await LogReport.find().populate('sales').populate({
          path: 'logSell',
          populate: {
            path: 'product'
          }
        }).exec();

        return res.response({
          status: 'success',
          size: findSize(result),
          result
        });
      },
      tags: ['api']
    }
  },
  {
    method: 'GET',
    path: '/logsell',
    options: {
      handler: async function(request, res) {
        const result = await LogSell.find().populate('product').exec();

        return res.response({
          status: "success",
          size: findSize(result),
          result
        });
      },
      tags: ['api']
    }
  }
]