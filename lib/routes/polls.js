const { Router } = require('express');
const Poll = require('../models/Poll');

module.exports = Router()

  //creates a new poll
  .post('/', (req, res, next) => {
    Poll
      .create(req.body)
      .then(poll => res.send(poll))
      .catch(next);
  })

  
