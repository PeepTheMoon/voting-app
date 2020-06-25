const { Router } = require('express');
const User = require('../models/User');
const ensureAuth = require('../middleware/ensureAuth');

//creates a session cookie that keeps the user's credentials stored in the browser for 3 hours.
const setCookie = (user, res) => {
  res.cookie('session', user.authToken(), {
    maxAge: 1000 * 60 * 60 * 6,
    httpOnly: true
  });
};

module.exports = Router()
//allows a new user to sign up and creates a cookie for them if signup is successful
  .post('/signup', (req, res, next) => {
    User
      .create(req.body)
      .then(user => {
        setCookie(user, res);
        res.send(user);
      })
      .catch(next);
  })

//allows a user with an account sign in and creates a session cookie
  .post('/login', (req, res, next) => {
    User
      .authorize(req.body.email, req.body.password)
      .then(user => {
        setCookie(user, res);
        res.send(user);
      })
      .catch(next);
  })

  //verifies a user is logged in
  .get('/verify', ensureAuth, (req, res) => {
    res.send(req.user);
  });
