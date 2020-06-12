const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');

describe('poll routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  let org;
  beforeEach(async() => {
    org = await Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    });
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('creates a new poll with POST', () => {
    return request(app)
      .post('/api/v1/polls')
      .send({
        organization: org._id,
        title: 'Should we defund the police?',
        description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
        options: ['for', 'against']
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: org.id,
          title: 'Should we defund the police?',
          description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
          options: ['for', 'against'],
          __v: 0 
        });
      });
  });

  it('gets all polls for a specific organization with GET', () => {
    return Poll.create({
      organization: org._id,
      title: 'Should we defund the police?',
      description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
      options: ['for', 'against']
    })
      .then(() => request(app).get(`/api/v1/polls?organization=${org.id}`))
      .then(res => {
        expect(res.body).toEqual([{
          organization: {
            _id: expect.anything(),
            title: 'Portland Police Department'
          },
          _id: expect.anything(),
          title: 'Should we defund the police?',
          description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
          options: ['for', 'against'],
          __v: 0
        }]);
      });
  });

  it('gets all polls by id for a specific organization with GET', () => {
    return Poll.create({
      organization: org._id,
      title: 'Should we defund the police?',
      description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
      options: ['for', 'against']
    })
      .then(poll => request(app).get(`/api/v1/polls/${poll.id}`))
      .then(res => {
        expect(res.body).toEqual({
          organization: {
            _id: expect.anything(),
            title: 'Portland Police Department',
            description: 'Police Department for Portland, OR',
            imageUrl: 'www.policeimage.com/police.png',
            __v: 0
          },
          _id: expect.anything(),
          title: 'Should we defund the police?',
          description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
          options: ['for', 'against'],
          __v: 0
        });
      });
  });

  it('updates a poll by id with PATCH', () => {
    return Poll.create({
      organization: org._id,
      title: 'Should we defund the police?',
      description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
      options: ['for', 'against']
    })
      .then(poll => {
        return request(app)
          .patch(`/api/v1/polls/${poll._id}`)
          .send({ 
            title: 'Should we have pizza for breakfast?', description: 'Everyone wants pizza for breakfast.  Is it a good idea?' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: org.id,
          title: 'Should we have pizza for breakfast?',
          description: 'Everyone wants pizza for breakfast.  Is it a good idea?',
          options: ['for', 'against'],
          __v: 0
        });
      });
  });

  it('deletes a poll by id with DELETE', () => {
    return Poll.create({
      organization: org._id,
      title: 'Should we defund the police?',
      description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
      options: ['for', 'against']
    })
      .then(poll => request(app).delete(`/api/v1/polls/${poll._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: org.id,
          title: 'Should we defund the police?',
          description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
          options: ['for', 'against'],
          __v: 0
        });
      });
  });
});
