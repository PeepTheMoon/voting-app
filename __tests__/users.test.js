const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const User = require('../lib/models/User');

describe('user routes', () => {
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

  it('creates a new user with POST', () => {
    return request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jenny',
        phone: '555-867-5309',
        email: 'jenny@jenny.com',
        communicationMedium: 'phone',
        imageUrl: 'www.myspace.com/jenny.png'
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          name: 'Jenny',
          phone: '555-867-5309',
          email: 'jenny@jenny.com',
          communicationMedium: 'phone',
          imageUrl: 'www.myspace.com/jenny.png',
          __v: 0
        });
      });
  });

  it('fails to create a new user with POST when bad data is entered', () => {
    return request(app)
      .post('/api/v1/users')
      .send({
        name: 'Jenny',
        phone: '555-867-5309',
        email: 'jenny@jenny.com',
        communicationMedium: 'text',
        imageUrl: 'www.myspace.com/jenny.png'
      })
      .then(res => {
        expect(res.body).toEqual({
          status: 400,
          message: 'User validation failed: communicationMedium: `text` is not a valid enum value for path `communicationMedium`.'
        });
      });
  });

  it('gets all users with GET', () => {
    return User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png'
    })
      .then(() => request(app).get('/api/v1/users'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          name: 'Jenny',
          imageUrl: 'www.myspace.com/jenny.png'
        }]);
      });
  });


});
