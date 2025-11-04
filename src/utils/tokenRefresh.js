const JWT = require('jsonwebtoken');

const decodeToken = (token) => {
  try {
    return JWT.decode(token);
  } catch (err) {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
};

module.exports = {
  isTokenExpired,
  decodeToken
};

