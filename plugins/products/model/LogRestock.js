const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { ObjectId } = mongoose.Schema.Types;

const LogRestockSchema = new Schema(
  {
    product: {
      type: ObjectId,
      ref: 'Product'
    },
    qty: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"]
    },
    gudang: {
      type: ObjectId,
      ref: 'User'
    },
    tgl: {
      type: Date,
      default: Date.now()
    }
  }
);

module.exports = mongoose.model('LogRestock', LogRestockSchema);