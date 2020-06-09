const { Router } = require('express');
const User = require('../models/User');

module.exports = Router()

  //creates a new user
  .post('/', (req, res, next) => {
    User
      .create(req.body)
      .then(user => res.send(user))
      .catch(next);
  })

  //gets all users
  .get('/', (req, res, next) => {
    User
      .find(req.query)
      .select({
        name: true,
        imageUrl: true
      })
      .then(users => res.send(users))
      .catch(next);
  })

  //gets a user by id
  .get('/:id', (req, res, next) => {
    User
      .findById(req.params.id)
      .then(user => res.send(user))
      .catch(next);
  });

