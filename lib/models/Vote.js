const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },

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

// schema.virtual('users', {
//   ref: 'User',
//   localField: '_id',
//   foreignField: 'Vote'
// });

module.exports = mongoose.model ('Vote', schema);
