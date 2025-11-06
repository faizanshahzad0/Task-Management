const jwt = require('jsonwebtoken');
const User = require('../schemas/userSchema');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
const NODE_ENV = process.env.NODE_ENV;

const optionalAuth = async (req, res, next) => {
  try {
    const accessToken = NODE_ENV === "dev"
      ? req.cookies?.['access-token'] || req.header('authorization')?.replace('Bearer ', '') || req.header('access-token')
      : req.header('authorization')?.replace('Bearer ', '') || req.header('access-token');

    if (!accessToken) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(accessToken, accessTokenSecret);
      const user = await User.findById(decoded.id);
      
      if (user) {
        req.user = user;
        req.userId = decoded.id;
      } else {
        req.user = null;
      }
    } catch (err) {
      req.user = null;
    }

    return next();
  } catch (error) {
    req.user = null;
    return next();
  }
};

module.exports = optionalAuth;

