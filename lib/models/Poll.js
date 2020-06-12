const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },

  title: {
    type: String,
    required: true,
    maxlength: 70
  },

  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  options: [String]
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

schema.virtual('votes', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'Poll',
  count: true
});

module.exports = mongoose.model ('Poll', schema);
