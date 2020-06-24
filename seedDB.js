require('dotenv').config();
require('./lib/utils/connect')();

const mongoose = require('mongoose');
const seed = require('./data-helpers/seed');

seed()
  .then(() => console.log('Database Seeded'))
  .finally(() => mongoose.connection.close());
