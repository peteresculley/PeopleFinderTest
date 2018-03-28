const mongoose = require('mongoose');
const mongooseRedisCache = require('mongoose-redis-cache');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

mongooseRedisCache(mongoose);

const dbconnection = (process.env.ENVIRONMENT === 'production') ? process.env.DB : 'mongodb://localhost:27017/turingr';
const localConnection = mongoose.createConnection(dbconnection);

const PeopleFinderResultSchema = new mongoose.Schema({
  queryId: String,
  photo: String,
  domain: String,
  name: String,
  title: String,
  linkedIn: String,
  location: String
}, {
  timestamps: true,
});

PeopleFinderResultSchema.set('redisCache', true);

const PeopleFinderResults = localConnection.model('peoplefinderresults', PeopleFinderResultSchema);

module.exports = PeopleFinderResults;
