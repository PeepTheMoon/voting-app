const mongoose = require('mongoose');

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
    maxlength: 60
  },

  communicationMedium: {
    type: String,
    required: true,
    enum: ['phone', 'email']
  },
  
  imageUrl: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.id;
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

module.exports = mongoose.model ('User', schema);
