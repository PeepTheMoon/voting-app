const { Router } = require('express');

const Membership = require('../models/Membership');

module.exports = Router()

  //creates a new membership
  .post('/', (req, res, next) => {
    Membership
      .create(req.body)
      .then(membership => res.send(membership))
      .catch(next);
  })

  //gets all users who are members of a particular organization
  .get('/', (req, res, next) => {
    Membership
    //finds ALL memberships associated with this query
      .find(req.query)
      .populate('organization', { 
        title: true, 
        imageUrl: true })
      .populate('user', { 
        name: true, 
        imageUrl: true })
    //needs to be plural since there are possibly more than one membership
      .then(memberships => res.send(memberships))
      .catch(next);
  })

//gets all organizations a specific user is a member of
  .get('/', (req, res, next) => {
    Membership
      .find(req.query)
      .populate('organization', { 
        title: true, 
        imageUrl: true })
      .populate('user', { 
        name: true, 
        imageUrl: true })
      .then(memberships => res.send(memberships))
      .catch(next);
  })

  //removes a membership and all votes associated with the membership
  .delete('/:id', (req, res, next) => {
    Membership
      .deleteAndAllVotes(req.params.id)
      .then(membership => res.send(membership))
      .catch(next);
  });
