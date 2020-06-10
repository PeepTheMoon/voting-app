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

  it('creates a new poll with POST', async() => {
    return request(app)
      .post('/api/v1/polls')
      .send({
        organization: org._id,
        title: 'Should we defund the police?',
        description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
        options: 'for'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: org.id,
          title: 'Should we defund the police?',
          description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
          options: 'for',
          __v: 0
        });
      });
  });

  it('fails to create a poll if bad data is given', async() => {
    return request(app)
      .post('/api/v1/polls')
      .send({
        organization: org._id,
        title: 'Should we defund the police?',
        description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
        options: 'yes'
      })
      .then(res => {
        expect(res.body).toEqual({
          status: 400,
          message: 'Poll validation failed: options: `yes` is not a valid enum value for path `options`.'
        });
      });
  });


});
