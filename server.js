// BASE SERVER SETUP
let newrelic = require('newrelic');

// CALL THE PACKAGES 
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let morgan = require('morgan');
let mongoose = require('mongoose');
mongoose.promise = global.Promise;

// Logging, Compression, and new relic
let compression = require('compression');

// Config
const config = require('./config');

// Load api Routes
let api = require('./app/routes/api').api;

// Connect to Mongo database
mongoose.connect(config.database)
  .then(() => {
    console.log('Successfully connected');
  })
  .catch((err) => {
    console.log(err.toString());
  })

// Use compression
app.use(compression());

// User Body parser to grab information from POST requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Configure app to handle CORS requests
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
  next();
})

// Log all requests to the console
app.use(morgan('dev'));
app.use('/api', api);

app.get('/', function(req, res) {
  res.send('Welcome to the api');
})

app.listen(config.port, function() {
  console.log("Yeah it is working");
});