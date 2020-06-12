const { Router } = require('express');

const Vote = require('../models/Vote');

module.exports = Router()

  //creates a new vote 
  .post('/', (req, res, next) => {
    Vote
      .create(req.body)
      .then(vote => res.send(vote))
      .catch(next);
  })

  //gets all votes on a poll
  .get('/', (req, res, next) => {
    Vote
      .find(req.query)
      .populate('poll')
      .then(votes => res.send(votes))
      .catch(next);
  })

  //gets all votes by a user
  .get('/', (req, res, next) => {
    Vote
      .find(req.query)
      .populate('user')
      .then(votes => res.send(votes))
      .catch(next);
  });
