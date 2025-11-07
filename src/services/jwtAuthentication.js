const JWT = require('jsonwebtoken');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const accToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
    }
    const token = JWT.sign(payload, accessTokenSecret, { expiresIn: '1d' });
    return token;
}

const refToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
    }
    const token = JWT.sign(payload, refreshTokenSecret, {expiresIn: "7d"});
    return token;
}

const validateAccessToken = (token) => {
  try {
    if (!token || token.split(".").length !== 3) {
      throw new Error("Malformed JWT token");
    }
    
    const payload = JWT.verify(token, accessTokenSecret);
    return payload;
  } catch (err) {
    console.error("JWT validation error:", err.message);
    throw new Error("Invalid or expired token");
  }
};

module.exports = { accToken, validateAccessToken, refToken };