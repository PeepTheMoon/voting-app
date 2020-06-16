require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Membership = require('../lib/models/Membership');
const Organization = require('../lib/models/Organization');
const User = require('../lib/models/User');

describe('membership routes', () => {
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

  it('creates a new membership with POST', async() => {
    const organization = await Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    });

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
      .then(() => agent

        .post('/api/v1/memberships')
        .send({
          organization: organization._id,
          user: user._id
        }))
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          user: user.id,
          __v: 0
        });
      });
  });

  it('gets all users within an organization with GET', async() => {
    const organization = await Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    });

    const user = await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png'
    });

    const membership = await Membership.create({
      organization: organization.id,
      user: user.id
    });

    return request(app)
      .get(`/api/v1/memberships?organization=${organization._id}`)
      .then(res => {
        expect(res.body).toEqual([{
          _id: membership.id,
          organization: { 
            _id: organization.id,
            title: organization.title,
            imageUrl: organization.imageUrl
          },
          user: {
            _id: user.id,
            name: user.name,
            imageUrl: user.imageUrl
          },
          __v: 0
        }]);
      });
  });

  it('gets all organizations a user is a member of with GET', async() => {
    const organization = await Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    });

    const user = await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png'
    });

    const membership = await Membership.create({
      organization: organization.id,
      user: user.id
    });

    return request(app)
      .get(`/api/v1/memberships?user=${user._id}`)
      .then(res => {
        expect(res.body).toEqual([{
          _id: membership.id,
          organization: { 
            _id: organization.id,
            title: organization.title,
            imageUrl: organization.imageUrl
          },
          user: {
            _id: user.id,
            name: user.name,
            imageUrl: user.imageUrl
          },
          __v: 0
        }]);
      });
  });

  it('deletes a user membership with DELETE', async() => {
    const organization = await Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    });

    const user = await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png'
    });

    const membership = await Membership.create({
      organization: organization.id,
      user: user.id
    });

    return request(app)
      .delete(`/api/v1/memberships/${membership._id}`)
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          organization: organization.id,
          user: user.id,
          __v: 0
        });
      });
  });
});
