// libraries
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

const http = require('http').Server(app);
let io = require("socket.io").listen(http);

dotenv.config();

mongoose.Promise = global.Promise;
const mongodb = (process.env.ENVIRONMENT === 'production') ? process.env.WEBSITEDB : 'mongodb://localhost:27017/turingr';
mongoose.connect(mongodb, {
  useMongoClient: true,
}, (err) => {
  if (err) throw err;
});

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(function(req, res, next) {
    res.io = io;
    next();
});

app.use(bodyParser.json({ extended: true, limit: 52428800 }));
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/', require('./routes/api'));
app.use('/input/', require('./routes/input'));
app.use(express.static('public'))

http.listen(Number(process.env.PORT), () => {
  console.log(`PeopleFinderIO listening on port ${Number(process.env.PORT)}`);
});

//io = io.listen(http);
io.on('connection', function (client) {
  console.log('client connected');

  // send the clients id to the client itself.
  client.send(client.id);

  client.on('disconnect', function () {
    console.log('client disconnected');
  });
});