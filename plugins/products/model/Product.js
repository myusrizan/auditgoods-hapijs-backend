const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    distributor: {
      type: String,
      trim: true
    },
    hargaModal: {
      type: Number,
      required: true
    },
    hargaJual: {
      type: Number,
      required: true
    },
    stok: {
      type: Number,
      default: 0,
    }
  }
);

module.exports = mongoose.model('Product', ProductSchema);