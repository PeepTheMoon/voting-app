const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const schema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    maxlength: 70
  },

  phone: {
    type: String,
    required: true,
    maxlength: 15
  },

  email: {
    type: String,
    required: true,
    maxlength: 60,
    unique: true
  },

  communicationMedium: {
    type: String,
    required: true,
    enum: ['phone', 'email']
  },
  
  imageUrl: {
    type: String,
    required: true
  },

  passwordHash: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.id;
      delete ret.passwordHash;
    }
  },
  toObject: {
    virtuals: true
  }
});

schema.virtual('memberships', {
  ref: 'Membership',
  localField: '_id',
  foreignField: 'User'
});

schema.virtual('votes', {
  ref: 'Votes',
  localField: '_id',
  foreignField: 'User'
});

schema.virtual('password').set(function(password) {
  this.passwordHash = bcrypt.hashSync(password, +process.env.SALT_ROUNDS || 8);
});

schema.statics.authorize = function(email, password) {
  return this.findOne({ email })
    .then(user => {
      if(!user) {
        throw new Error('Invalid Email and/or Password');
      }

      if(!bcrypt.compareSync(password, user.passwordHash)) {
        throw new Error('Invalid Email and/or Password');
      }

      return user;
    });
};

schema.statics.verifyToken = function(token) {
  const { sub } = jwt.verify(token, process.env.APP_SECRET || 'somestuffthatssecret');
  
  return this.hydrate(sub);
};

schema.methods.authToken = function() {
  return jwt.sign({ sub: this.toJSON() }, process.env.APP_SECRET || 'somestuffthatssecret', {
    expiresIn: '3h'
  });
};

module.exports = mongoose.model ('User', schema);
