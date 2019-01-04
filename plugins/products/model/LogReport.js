const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { ObjectId } = mongoose.Schema.Types;

const LogReportSchema = new Schema(
  {
    logSell: {
      type: ObjectId,
      ref: 'LogSell'
    },
    sales: {
      type: ObjectId,
      ref: 'User'
    },
    tglLog: {
      type: Date,
      default: Date.now()
    }
  }
);

module.exports = mongoose.model('LogReport', LogReportSchema);