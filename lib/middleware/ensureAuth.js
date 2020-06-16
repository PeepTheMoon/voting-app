const User = require('../models/User');

//using JSON web tokens to allow for us to store a cookie in the browser to allow user to make requests without having login again
module.exports = (req, res, next) => {

  //reads a session cookie and stores it as a token
  const token = req.cookies.session;

  //verifies that the cookie belongs to the user and that the session hasn't expired
  const user = User.verifyToken(token);
  
  //sets the cookie to the owner/user
  req.user = user;
  
  next();
};
