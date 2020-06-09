const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Organization = require('../lib/models/Organization');

describe('organization routes', () => {
  beforeAll(async() => {
    const uri = await mongod.getUri();
    return connect(uri);
  });

  beforeEach(() => {
    return mongoose.connection.dropDatabase();
  });

  afterAll(async() => {
    await mongoose.connection.close();
    return mongod.stop();
  });

  it('creates an organization with POST', () => {
    return request(app)
      .post('/api/v1/organizations')
      .send({
        title: 'Portland Police Department',
        description: 'Police Department for Portland, OR',
        imageUrl: 'www.policeimage.com/police.png'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Portland Police Department',
          description: 'Police Department for Portland, OR',
          imageUrl: 'www.policeimage.com/police.png',
          __v: 0
        });
      });
  });

  it('fails to create an organization if bad data is given', () => {
    return request(app)
      .post('/api/v1/organizations')
      .send({
        name: 'Portland Police Department',
        description: 'Police Department for Portland, OR',
        imageUrl: 'www.policeimage.com/police.png'
      })
      .then(res => {
        expect(res.body).toEqual({
          status: 400,
          message: 'Organization validation failed: title: Path `title` is required.'
        });
      });
  });

});
