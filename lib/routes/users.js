const { Router } = require('express');
const User = require('../models/User');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()

  //gets all users 
  .get('/', ensureAuth, (req, res, next) => {
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
  .get('/:id', ensureAuth, (req, res, next) => {
    User
      .findById(req.params.id)
      .then(user => res.send(user))
      .catch(next);
  })

  //updates a specific user's info 
  .patch('/:id', ensureAuth, (req, res, next) => {
    User
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(user => res.send(user))
      .catch(next);
  })
  
  //deletes a user by id
  .delete('/:id', ensureAuth, (req, res, next) => {
    User
      .findByIdAndDelete(req.params.id)
      .then(user => res.send(user))
      .catch(next);
  });
