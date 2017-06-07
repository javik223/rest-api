// BASE SERVER SETUP

// CALL THE PACKAGES 
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
// For connecting to our Mongo database instance
const mongoose = require('mongoose');
mongoose.promise = global.Promise;

// Config
const config = require('../../config');
const superSecret = config.secret;

// Authentication
const jwt = require('jsonwebtoken');

const apiRouter = express.Router();

// Load Models
const User = require('../models/users');

// User Body parser to grab information from POST requests
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// Authentication Route
apiRouter.post('/authenticate', function(req, res) {
  User.findOne({
    username: req.body.username
  })
    .select('name username password')
      .exec()
        .then((user) => {
          if (!user) {
            res.json({
              success: false,
              message: 'Authentication failed. User not found'
            })
          } else if (user) {
            // Check if password matches
            const validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
              res.json({
                success: false,
                message: 'Authentication failed. Wrong password'
              });
            } else {
              // If user is found and password is right
              const token = jwt.sign({
                name: user.name,
                username: user.username
              }, secret, {
                expiresIn: 1440 // expires in 24hours
              });

              // Return the information including token as JSON
              res.json({
                success: true,
                message: 'Enjoy your token!',
                token
              })
            }
          }
        })
        .catch((err) => {
          res.json(err);
        })
});

// Middleware to authenticate users and provie a JWT
apiRouter.use(function(req, res, next) {
  let token = req.body.token || req.query.token || req.headers['x-access-token'];

  // Decode token
  if (token) {
    // verifieds secret and checks exp
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        return res.status(403).send({
          success: false,
          message: 'Failed to authenticate token.'
        });
      } else {
        // If everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // If there is no token
    // Return an HTTP response of 403 (access forbidden) and an error message
    return res.status(403).send({
      success: false,
      message: 'No  token provided.'
    });
  }
});

// Log all requests to the console

apiRouter.use(function(req, res, next) {
  console.log('Somebody just came to our app!')

  next();
})

apiRouter.route('/users')
  .post(function(req, res) {
    // Create a new instance of the User model
    let user = new User();

    // Set the users information from the request
    user.name = req.body.name;
    user.username = req.body.username;
    user.password = req.body.password;

    // // Save the user and check for erros
    // user.save(function(err) {
    //   if (err) {
    //     // Dupblicate entry
        
    //   }

    // });

    user.save()
      .then(() => {
        res.json({ message: 'User created!' });        
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.json({
            success: false,
            message: 'A user with that username already exists'
          });
        } else {
          return res.send(err);
        }
      });

  })
  .get(function(req, res) {
    User.find()
      .then((users) => {
        res.json(users);
      })
      .catch((err) => {
        res.send(err);
      })
  });

// Routes for individual user_id
apiRouter.route('/users/:user_id')
  .get(function(req, res) {
    User.findById(req.params.user_id)
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
          res.send(err);
      });
  })
  // Update the user with this id 
  .put(function(req, res) {
    User.findById(req.params.user_id)
      .then((user) => {
        if (req.body.name) {
          user.name = req.body.name;
        }

        if (req.body.username) {
          user.username = req.body.username;
        }

        if(req.body.password) {
          user.password = req.body.password;
        }
        // Save the user
        user.save()
          .then(() => {
            res.json({
              message: 'User updated!'
            });
          });
      })
      .catch((err) => {
        res.send(err);
      })
  })
  // Delete user with this id
  // (accessed at PUT /api/users/:user_id)
  .delete(function(req, res) {
    User.remove({
      _id: req.params.user_id
    })
      .then(() => {
        res.json({
          message: `User successfully deleted`
        })
      })
      .catch((err) => {
        res.send(err);
      })
    });


apiRouter.get('/', function(req, res){
    res.json({message: 'Light to the world'});
 });

apiRouter.get('/me', function(req, res) {
  res.send(req.decoded);
})

module.exports.api = apiRouter;
