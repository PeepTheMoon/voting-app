require('dotenv').config();

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

  it('gets all users with GET', async() => {
    const user = await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png',
      password: '5309'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })
      .then(() => {
        return agent
          .get('/api/v1/users')
          .then(res => {
            expect(res.body).toEqual([{
              _id: user.id,
              name: 'Jenny',
              imageUrl: 'www.myspace.com/jenny.png'
            }]);
          });
      });
  });

  it('gets a user by id with GET', async() => {
    const user = await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png',
      password: '5309'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })
      .then(() => {
        return agent
      
          .get(`/api/v1/users/${user._id}`)
          .then(res => {
            expect(res.body).toEqual({
              _id: user.id,
              name: 'Jenny',
              phone: '555-867-5309',
              email: 'jenny@jenny.com',
              communicationMedium: 'phone',
              imageUrl: 'www.myspace.com/jenny.png',
              __v:0
            });
          });
      });
  });

  it('updates a user by id with PATCH', async() => {
    const user = await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png',
      password: '5309'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })
      .then(() => {
        return agent
          .patch(`/api/v1/users/${user._id}`)
          .send({
            phone: '555-555-5555',
            email: 'jenny@gmail.com'
          });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: user.id,
          name: 'Jenny',
          phone: '555-555-5555',
          email: 'jenny@gmail.com',
          communicationMedium: 'phone',
          imageUrl: 'www.myspace.com/jenny.png',
          __v: 0
        });
      });
  });

  it('deletes a user by id with DELETE', async() => {
    const user = await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png',
      password: '5309'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })
      .then(() => {
        return agent
          .delete(`/api/v1/users/${user._id}`)
          .then(res => {
            expect(res.body).toEqual({
              _id: user.id,
              name: 'Jenny',
              phone: '555-867-5309',
              email: 'jenny@jenny.com',
              communicationMedium: 'phone',
              imageUrl: 'www.myspace.com/jenny.png',
              __v: 0
            });
          });
      });
  });
});
