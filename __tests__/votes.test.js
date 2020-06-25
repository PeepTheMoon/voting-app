require('dotenv').config();

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose');
const connect = require('../lib/utils/connect');

const request = require('supertest');
const app = require('../lib/app');
const Poll = require('../lib/models/Poll');
const Vote = require('../lib/models/Vote');
const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');

describe('vote routes', () => {
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

  it('creates a new vote with POST', async() => {
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

    const poll = await Poll.create({
      organization: organization._id,
      title: 'Should we defund the police?',
      description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
      options: ['for', 'against']
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })

      .then(() => agent
        .post('/api/v1/votes')
        .send({
          poll: poll.id,
          user: user.id,
          optionSelected: 'for'
        })
        .then(res => {
          expect(res.body).toEqual({
            _id: expect.anything(),
            poll: poll.id,
            user: user.id,
            optionSelected: 'for',
            __v:0
          });
        }));
  });

  it('gets all votes with GET', async() => {
    const organization = await Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    }); 

    const poll = await Poll.create({
      organization: organization._id,
      title: 'Should we defund the police?',
      description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
      options: ['for', 'against']
    });

    const user = await User.create({
      name: 'Jenny',
      phone: '555-867-5309',
      email: 'jenny@jenny.com',
      communicationMedium: 'phone',
      imageUrl: 'www.myspace.com/jenny.png',
      password: '5309'
    });

    await Vote.create({
      poll: poll._id,
      user: user._id,
      optionSelected: 'for'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })

      .then(() => agent
        .get(`/api/v1/votes?poll=${poll.id}`)
        .then(res => {
          expect(res.body).toEqual([{
            _id: expect.anything(),
            poll: {
              __v: 0,
              _id: poll.id,
              description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
              options: ['for', 'against'],
              organization: organization.id,
              title: 'Should we defund the police?'
            },
            user: user.id,
            optionSelected: 'for',
            __v:0
          }]);
        }));
  });

  it('gets all votes by a user with GET', async() => {
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

    const poll = await Poll.create({
      organization: organization._id,
      title: 'Should we defund the police?',
      description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
      options: ['for', 'against']
    });

    await Vote.create({
      poll: poll._id,
      user: user._id,
      optionSelected: 'for'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })

      .then(() => agent
        .get(`/api/v1/votes?user=${user.id}`)
        .then(res => {
          expect(res.body).toEqual([{
            _id: expect.anything(),
            poll: {
              __v: 0,
              _id: poll.id,
              description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
              options: ['for', 'against'],
              organization: organization.id,
              title: 'Should we defund the police?'
            },
            user: user.id,
            optionSelected: 'for',
            __v:0
          }]);
        }));
  });

  it('allows user to vote only once on a poll, and updates their vote if they`ve already voted', async() => {
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

    const poll = await Poll.create({
      organization: organization._id,
      title: 'Should we defund the police?',
      description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
      options: ['for', 'against']
    });

    await Vote.create({
      poll: poll._id,
      user: user._id,
      optionSelected: 'for'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })

      .then(() => agent
        .post('/api/v1/votes/')
        .send({
          poll: poll.id,
          user: user.id,
          optionSelected: 'against'
        })
        .then(res => {
          expect(res.body).toEqual({
            _id: expect.anything(),
            poll: poll.id,
            user: user.id,
            optionSelected: 'against',
            __v: 0
          });
        })
      );
  });

  it('allows user to change their vote with PATCH', async() => {
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

    const poll = await Poll.create({
      organization: organization._id,
      title: 'Should we defund the police?',
      description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
      options: ['for', 'against']
    });

    const vote = await Vote.create({
      poll: poll._id,
      user: user._id,
      optionSelected: 'for'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })

      .then(() => agent
        .patch(`/api/v1/votes/${vote._id}`)
        .send({ optionSelected:'against' })
        .then(res => {
          expect(res.body).toEqual({
            poll: poll.id,
            user: user.id,
            optionSelected: 'against',
            __v: 0,
            _id: expect.anything()
          });
        }));
  });

  it('gets a list of total votes on a poll and totals for each vote option on a poll with GET', async() => {

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

    const poll = await Poll.create({
      organization: organization._id,
      title: 'Should we defund the police?',
      description: 'The police department has a long history of brutality.  Should we move funds to other services instead?',
      options: ['for', 'against']
    });

    const vote = await Vote.create({
      poll: poll._id,
      user: user._id,
      optionSelected: 'for'
    });

    const agent = request.agent(app);

    return agent
      .post('/api/v1/auth/login')
      .send({
        email: 'jenny@jenny.com',
        password: '5309'
      })

      .then(() => agent
        .get(`/api/v1/votes/vote-totals/${vote.poll}`)
        .then(res => {
          expect(res.body).toEqual([{
            _id: null,
            count: expect.any(Number),
            voteOptions: expect.any(Array)
          }]);
        }));
  });
});
