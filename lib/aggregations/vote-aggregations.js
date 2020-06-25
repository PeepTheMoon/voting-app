const totalsForVotes = [
  {
    '$match': {
      'poll': new ObjectId('5ef3c957e3234a37a62e1e36')
    }
  }, {
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
