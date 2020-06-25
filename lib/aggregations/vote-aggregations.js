const mongoose = require('mongoose');

const totalsForVotes = id => [
  {
    '$match': {
      'poll': mongoose.Types.ObjectId(id)
    }
  }, 
  {
    '$sortByCount': '$optionSelected'
  }, {
    '$group': {
      '_id': null, 
      'count': {
        '$sum': '$count'
      }, 
      'voteOptions': {
        '$push': {
          'count': '$count', 
          'voteOptions': '$_id'
        }
      }
    }
  }
];

module.exports = {
  totalsForVotes
};
