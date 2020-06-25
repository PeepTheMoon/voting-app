const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 70
  },
  description: {
    type: String,
    required: true,
    maxlength: 150
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

schema.virtual('polls', {
  ref: 'Poll',
  localField: '_id',
  foreignField: 'Organization'
});

module.exports = mongoose.model ('Organization', schema);
