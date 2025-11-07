const addNewTokenToResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    if (req.newAccessToken) {
      data.newAccessToken = req.newAccessToken;
      data.tokenRefreshed = true;
    }
    return originalJson(data);
  };
  
  next();
};

module.exports = addNewTokenToResponse;

