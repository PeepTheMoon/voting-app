const { Router } = require('express');

const Vote = require('../models/Vote');

module.exports = Router()

  //creates a new vote 
  .post('/', (req, res, next) => {
    Vote
      .create(req.body)
      .then(vote => res.send(vote))
      .catch(next);
  });