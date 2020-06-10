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

  //gets all polls for a specific organization
  .get('/', (req, res, next) => {
    Poll  
      .find(req.query)
      //.select instead?
      .populate('organization', 
        {
          _id: true,
          title: true
        })
      .then(polls => res.send(polls))
      .catch(next);
  });

  //gets a poll for a specific organization by id
  // .get('/:id')

  
