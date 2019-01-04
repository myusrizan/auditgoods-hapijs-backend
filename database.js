'use strict'

const mongoose = require('mongoose');
const app = require('./app.json');
const config = app.config;

mongoose.connect('mongodb://localhost:27017/' + config.db);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback() {
    console.log('Connection with database succeeded.');
});

exports.db = db;