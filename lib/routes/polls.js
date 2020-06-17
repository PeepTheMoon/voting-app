const { Router } = require('express');

const Poll = require('../models/Poll');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()

  //creates a new poll
  .post('/', ensureAuth, (req, res, next) => {
    Poll
      .create({ ...req.body })
      .then(poll => res.send(poll))
      .catch(next);
  })

  //gets all polls for a specific organization
  .get('/', ensureAuth, (req, res, next) => {
    Poll  
      .find(req.query)
      .populate('organization', 
        {
          title: true
        })
      .then(polls => res.send(polls))
      .catch(next);
  })

//gets a poll for a specific organization by id
  .get('/:id', ensureAuth, (req, res, next) => {
    Poll
      .findById(req.params.id)
      .populate('organization')
      .populate('votes')
      .then(poll => res.send(poll))
      .catch(next);
  })

  //updates a poll's title and/or description
  .patch('/:id', ensureAuth, (req, res, next) => {
    Poll
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(poll => res.send(poll))
      .catch(next);
  })

  //deletes a poll by id
  .delete('/:id', ensureAuth, (req, res, next) => {
    Poll
      .findByIdAndDelete(req.params.id)
      .then(poll => res.send(poll))
      .catch(next);
  });
