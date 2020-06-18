require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');

const Organization = require('../lib/models/Organization');
const Poll = require('../lib/models/Poll');
const User = require('../lib/models/User');
const Membership = require('../lib/models/Membership');

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

  it('creates an organization with POST', async() => {
    await User.create({
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
        }));
  });

  it('fails to create an organization if bad data is given', async() => {
    await User.create({
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
        }));
  });

  it('gets all organizations with GET', async() => {
    await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png',
      password: '5309'
    });

    await Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })

      .then(() => agent
        .get('/api/v1/organizations')
        .then(res => {
          expect(res.body).toEqual([{
            _id: expect.anything(),
            title: 'Portland Police Department',
            imageUrl: 'www.policeimage.com/police.png'
          }]);
        }));
  });

  it('gets an organization by id and its members with GET', async() => {
    const user = await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png',
      password: '5309'
    });

    const organization = await Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    });

    await Membership.create({
      organization: organization._id,
      user: user._id
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })

      .then(() => agent
        .get(`/api/v1/organizations/${organization._id}`))
      .then(res => {
        expect(res.body).toEqual({
          _id: organization.id,
          title: 'Portland Police Department',
          description: 'Police Department for Portland, OR',
          imageUrl: 'www.policeimage.com/police.png',
          memberships: [{
            _id: expect.anything(),
            organization: organization.id,
            user: {
              _id: user.id,
              name: user.name,
              imageUrl: user.imageUrl
            },
            __v: 0
          }],
          __v: 0
        });
      });
  });

  it('updates an organization by id with PATCH', async() => {
    await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png',
      password: '5309'
    });

    const organization = await Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })

      .then(() => agent
        .patch(`/api/v1/organizations/${organization._id}`)
        .send({ description: 'Portland City Police' })
      )
      .then(res => {
        expect(res.body).toEqual({
          _id: organization.id,
          title: 'Portland Police Department',
          description: 'Portland City Police',
          imageUrl: 'www.policeimage.com/police.png',
          __v: 0
        });
      });
  });

  it('deletes an organization and all polls and votes associated with the organization', async() => {

    await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png',
      password: '5309'
    });

    const organization = await Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    });

    await Poll.create([
      {
        organization: organization._id,
        title: 'Should we defund the police?',
        description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
        options: ['for', 'against']
      }
    ]);

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })

      .then(() => agent
        .delete(`/api/v1/organizations/${organization._id}`)
        .then(res => {
          expect(res.body).toEqual({
            _id: expect.anything(),
            title: 'Portland Police Department',
            description: 'Police Department for Portland, OR',
            imageUrl: 'www.policeimage.com/police.png',
            __v: 0
          });

          return Poll.find({ organization: organization._id });
        })
        .then(polls => {
          expect(polls).toEqual([]);
        }));
  });
});
