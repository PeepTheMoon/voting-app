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

  it('gets all organizations with GET', () => {
    return Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    })
      .then(() => request(app).get('/api/v1/organizations'))
      .then(res => {
        expect(res.body).toEqual([{
          _id: expect.anything(),
          title: 'Portland Police Department',
          imageUrl: 'www.policeimage.com/police.png'
        }]);
      });
  });

  it('gets an organization by id with GET', () => {
    return Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    })
      .then(organization => request(app).get(`/api/v1/organizations/${organization._id}`))
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

  it('updates an organization by id with PATCH', () => {
    return Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    })
      .then(organization => {
        return request(app)
          .patch(`/api/v1/organizations/${organization._id}`)
          .send({ description: 'Portland City Police' });
      })
      .then(res => {
        expect(res.body).toEqual({
          _id: expect.anything(),
          title: 'Portland Police Department',
          description: 'Portland City Police',
          imageUrl: 'www.policeimage.com/police.png',
          __v: 0
        });
      });
  });

  it('deletes an organization by id with DELETE', () => {
    return Organization.create({
      title: 'Portland Police Department',
      description: 'Police Department for Portland, OR',
      imageUrl: 'www.policeimage.com/police.png'
    })
      .then(organization => request(app).delete(`/api/v1/organizations/${organization._id}`))
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
});
