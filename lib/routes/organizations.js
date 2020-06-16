const { Router } = require('express');

const Organization = require('../models/Organization');

module.exports = Router()

  //creates a new organization
  .post('/', (req, res, next) => {
    Organization
      .create(req.body)
      .then(organization => res.send(organization))
      .catch(next);
  })

  //gets all organizations in database
  .get('/', (req, res, next) => {
    Organization
      .find(req.query)
      .select({
        title: true,
        imageUrl: true
      })
      .then(organizations => res.send(organizations))
      .catch(next);
  })

  //gets one organization by id
  .get('/:id', (req, res, next) => {
    Organization
      .findById(req.params.id)
      .populate('memberships', {
        organization: true,
        user: true
      })
      .then(organization => res.send(organization))
      .catch(next);
  })

  //updates an organization by id
  .patch('/:id', (req, res, next) => {
    Organization
      .findByIdAndUpdate(req.params.id, req.body, { new: true })
      .then(organization => res.send(organization))
      .catch(next);
  })

  //deletes an organization by id from the database
  .delete('/:id', (req, res, next) => {
    Organization
      .deleteOrgPlusPollsAndVotes(req.params.id)
      .then(organization => res.send(organization))
      .catch(next);
  });
