const mongoose = require('mongoose');

const schema = new mongoose.Schema({

  poll: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  optionSelected: {
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

schema.statics.deleteAllVotes = function(id) {
  return Promise.all([
    this.findByIdAndDelete(id),
    this.model('User').deleteMany({ vote: id 
    })
  ])
    .then(([vote]) => vote);
};

module.exports = mongoose.model ('Vote', schema);
