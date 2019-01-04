const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { ObjectId } = mongoose.Schema.Types;

const LogSellSchema = new Schema(
  {
    tglBeli: {
      type: Date,
      default: Date.now()
    },
    clientName: {
      type: String,
      required: true,
      trim: true
    },
    product: {
      type: ObjectId,
      ref: 'Product'
    },
    qty: {
      type: Number,
      min: 1,
      required: true
    },
    hargaPerItem: {
      type: Number,
      required: true
    },
    hargaTotal: {
      type: Number
    }
  }
);

module.exports = mongoose.model('LogSell', LogSellSchema);