const JWT = require('jsonwebtoken');
const User = require('../models/userModel');
const { accToken } = require('../services/jwtAuthentication');
const { isTokenExpired, decodeToken } = require('../utils/tokenRefresh');

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

const authenticateToken = async (req, res, next) => {
  try {
    const accessToken = req.header('authorization')?.replace('Bearer ', '') || req.header('access-token');
    const refreshToken = req.header('x-auth-token') || req.header('refresh-token');

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ 
        error: "Tokens required",
        message: "Please provide access token and refresh token"
      });
    }

    const accessTokenExpired = isTokenExpired(accessToken);

    if (accessTokenExpired) {
      if (!refreshToken) {
        return res.status(401).json({ 
          error: "Access token expired",
          message: "Access token expired. Please provide refresh token"
        });
      }

      const refreshTokenExpired = isTokenExpired(refreshToken);

      if (refreshTokenExpired) {
        const decoded = decodeToken(refreshToken);
        
        if (decoded && decoded.id) {
          const user = await User.findById(decoded.id);
          if (user && user.refreshToken === refreshToken) {
            user.refreshToken = null;
            await user.save();
          }
        }

        return res.status(401).json({ 
          error: "Refresh token expired",
          message: "Refresh token has expired. Please login again.",
          logout: true
        });
      }

      try {
        const decoded = await JWT.verify(refreshToken, refreshTokenSecret);
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return res.status(404).json({ 
            error: "User not found",
            message: "User associated with refresh token not found"
          });
        }

        if (user.refreshToken !== refreshToken) {
          return res.status(403).json({ 
            error: "Invalid refresh token",
            message: "Refresh token does not match stored token"
          });
        }

        const newAccessToken = accToken(user);

        req.user = user;
        req.userId = decoded.id;
        req.newAccessToken = newAccessToken;
        
        return next();
      } catch (verifyErr) {
        return res.status(403).json({ 
          error: "Invalid refresh token",
          message: "Refresh token verification failed",
          details: verifyErr.message
        });
      }
    }

    try {
      const decoded = await JWT.verify(accessToken, accessTokenSecret);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ 
          error: "User not found",
          message: "User associated with token not found"
        });
      }

      req.user = user;
      req.userId = decoded.id;
      next();
    } catch (verifyErr) {
      return res.status(403).json({ 
        error: "Invalid access token",
        message: "Access token verification failed",
        details: verifyErr.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "Authentication error",
      message: "Failed to authenticate token",
      details: error.message
    });
  }
};

module.exports = authenticateToken;

