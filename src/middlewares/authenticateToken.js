const jwt = require('jsonwebtoken');
const User = require('../schemas/userSchema');
const { accToken } = require('../services/jwtAuthentication');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const authenticateToken = async (req, res, next) => {
  try {
    const accessToken =
      req.header('authorization')?.replace('Bearer ', '') ||
      req.header('access-token');
    const refreshToken =
      req.header('x-auth-token') || req.header('refresh-token');

    if (!accessToken && !refreshToken) {
      return res.status(401).json({
        error: "Tokens required",
        message: "Please provide access token and refresh token",
      });
    }

    try {
      const decoded = jwt.verify(accessToken, accessTokenSecret);
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      req.user = user;
      req.userId = decoded.id;
      return next();
    } catch (err) {
      if (err.name !== 'TokenExpiredError') {
        return res.status(403).json({
          error: "Invalid access token",
          message: err.message,
        });
      }
    }

    if (!refreshToken) {
      return res.status(401).json({
        error: "Access token expired",
        message: "Access token expired. Please provide refresh token",
      });
    }

    try {
      const decodedRefresh = jwt.verify(refreshToken, refreshTokenSecret);
      const user = await User.findById(decodedRefresh.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.refreshToken !== refreshToken) {
        return res.status(403).json({
          error: "Invalid refresh token",
          message: "Refresh token does not match stored token",
        });
      }

      const newAccessToken = accToken(user);
      req.user = user;
      req.userId = decodedRefresh.id;
      req.newAccessToken = newAccessToken;

      return next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        const decoded = jwt.decode(refreshToken);
        if (decoded?.id) {
          const user = await User.findById(decoded.id);
          if (user && user.refreshToken === refreshToken) {
            user.refreshToken = null;
            await user.save();
          }
        }
        return res.status(401).json({
          error: "Refresh token expired",
          message: "Refresh token has expired. Please login again.",
          logout: true,
        });
      }

      return res.status(403).json({
        error: "Invalid refresh token",
        message: err.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Authentication error",
      message: error.message,
    });
  }
};

module.exports = authenticateToken;
