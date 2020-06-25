const chance = require('chance').Chance();
const Poll = require('../lib/models/Poll');
const Vote = require('../lib/models/Vote');
const User = require('../lib/models/User');
const Organization = require('../lib/models/Organization');
const Membership = require('../lib/models/Membership');

module.exports = async({ memberships = 100, organizations = 10, users = 50, polls = 50,  votes = 200 } =  {}) => {
  
  const createdUsers = await User.create([...Array(users)].map((_, i) => ({
    name: chance.name(),
    phone: chance.phone(),
    email: `jenny${i}@jenny.com`,
    communicationMedium: chance.pickone(['phone', 'email']),
    imageUrl: chance.avatar(),
    password: '5309'
  })));

  const createdOrganizations = await Organization.create([...Array(organizations)].map(() => ({
    title: chance.sentence({ words: 5 }),
    description: chance.sentence({ words: 12 }),
    imageUrl: chance.url({ path: 'images' })
  })));

  await Membership.create([...Array(memberships)].map(() => ({
    organization: chance.pickone(createdOrganizations)._id,
    user: chance.pickone(createdUsers)._id
  })));

  const createdPolls = await Poll.create([...Array(polls)].map(() => ({
    organization: chance.pickone(createdOrganizations)._id,
    title: chance.sentence({ words: 5 }),
    description: chance.sentence({ words: 15 }),
    options: chance.pickone(['for', 'against'])
  })));

  await Vote.create([...Array(votes)].map(() => ({
    poll: chance.pickone(createdPolls)._id,
    user: chance.pickone(createdUsers)._id,
    optionSelected: chance.pickone(['for', 'against'])
  })));
};
