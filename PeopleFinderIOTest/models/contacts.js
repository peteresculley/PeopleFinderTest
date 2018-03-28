const mongoose = require('mongoose');
const mongooseRedisCache = require('mongoose-redis-cache');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

mongooseRedisCache(mongoose);

const dbconnection = (process.env.ENVIRONMENT === 'production') ? process.env.DB : 'mongodb://localhost:27017/turingr';
const localConnection = mongoose.createConnection(dbconnection);

const ContactSchema = new mongoose.Schema({
  toofrId: String,
  photo: String,
  confidence: Number,
  domain: String,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  title: String,
  titleLowercase: String,
  titlesInDescriptions: Object,
  username: String,
  linkedIn: String,
  location: String,
  company: String,
  companyLowercase: String,
  cleanCompany: String,
  descriptions: Object,
}, {
  timestamps: true,
});

ContactSchema.set('redisCache', true);

const Contacts = localConnection.model('contacts', ContactSchema);

module.exports = Contacts;
