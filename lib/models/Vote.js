const mongoose = require('mongoose');
const { totalsForVotes } = require('../aggregations/vote-aggregations');

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

schema.statics.totalsForVotes = function(id) {
  return this.aggregate(totalsForVotes(id));
};

module.exports = mongoose.model ('Vote', schema);
