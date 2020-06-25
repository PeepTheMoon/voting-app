const { Router } = require('express');

const Vote = require('../models/Vote');
const ensureAuth = require('../middleware/ensureAuth');

module.exports = Router()

  //creates a new vote 
  .post('/', ensureAuth, (req, res, next) => {
    Vote
      .create({ ...req.body })
      .then(vote => res.send(vote))
      .catch(next);
  })

  //gets all votes on a poll
  .get('/', ensureAuth, (req, res, next) => {
    Vote
      .find(req.query)
      .populate('poll')
      .then(votes => res.send(votes))
      .catch(next);
  })

  //gets all votes by a user
  .get('/', ensureAuth, (req, res, next) => {
    Vote
      .find(req.query)
      .populate('user')
      .then(votes => res.send(votes))
      .catch(next);
  })

  //gets a list of total votes and totals for each vote option on a poll
  .get('/vote-totals/:id', ensureAuth, (req, res, next) => {
    Vote
      .totalsForVotes(req.params.id)
      .then(totals => res.send(totals))
      .catch(next);

  })

  //post to only allows a user to vote once on a poll and updates their vote if they have already placed a vote
  .post('/', ensureAuth, (req, res, next) => {
    Vote
      .findOneAndUpdate(
        { 
          poll: req.body.poll, 
          user: req.body.user 
        },
        req.body, {
          new: true,
          upsert: true
        })
      .then(vote => res.send(vote))
      .catch(next);
  })

  //allows user to change their vote
  .patch('/:id', ensureAuth, (req, res, next) => {
    Vote
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(vote => res.send(vote))
      .catch(next);
  });
