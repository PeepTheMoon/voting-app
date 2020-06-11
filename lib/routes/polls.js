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
          title: true
        })
      .then(polls => res.send(polls))
      .catch(next);
  })



//gets a poll for a specific organization by id
  .get('/:id', (req, res, next) => {
    Poll
      .findById(req.params.id)
      .populate('organization')
      // .populate('votes' { total: true })
      .then(poll => res.send(poll))
      .catch(next);
  })

  //updates a poll's title and/or description
  .patch('/:id', (req, res, next) => {
    Poll
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(poll => res.send(poll))
      .catch(next);
  })

  //deletes a poll by id
  .delete('/:id', (req, res, next) => {
    Poll
      .findByIdAndDelete(req.params.id)
      .then(poll => res.send(poll))
      .catch(next);
  });
