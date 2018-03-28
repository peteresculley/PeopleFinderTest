const mongoose = require('mongoose');
const mongooseRedisCache = require('mongoose-redis-cache');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

mongooseRedisCache(mongoose);

const dbconnection = (process.env.ENVIRONMENT === 'production') ? process.env.DB : 'mongodb://localhost:27017/turingr';
const localConnection = mongoose.createConnection(dbconnection);

const peopleFinderQueriesSchema = new mongoose.Schema({
  domain: { type: String },
  title: { type: String },
  company: { type: String },
  status: { type: Number }, // 0: default, 1: in progress, 2: ready, 3: error
}, {
  timestamps: true,
});

peopleFinderQueriesSchema.set('redisCache', true);

const PeopleFinderQueries = localConnection.model('peoplefinderqueries', peopleFinderQueriesSchema);

module.exports = PeopleFinderQueries;
