const mongoose = require('mongoose');
const mongooseRedisCache = require('mongoose-redis-cache');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

mongooseRedisCache(mongoose);

const dbconnection = (process.env.ENVIRONMENT === 'production') ? process.env.DB : 'mongodb://localhost:27017/turingr';
const localConnection = mongoose.createConnection(dbconnection);

const SocketQuerySchema = new mongoose.Schema({
  socketId: String,
  queryId: String
}, {
  timestamps: true,
});

SocketQuerySchema.set('redisCache', true);

const SocketQueries = localConnection.model('socketqueries', SocketQuerySchema);

module.exports = SocketQueries;
