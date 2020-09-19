const handleSignout = (redisClient) => (req, res) => {
  const { authorization } = req.headers;
  if (authorization.includes('Bearer')) {
      const token = authorization.slice(7,authorization.length);
      if (!token) {
        return res.status(401).json('unauthorized')
      }
      return redisClient.del(token, (err, reply) => {
        if (err || !reply) {
          return res.status(400).json('unauthorized')
        }
        else {
          return res.json({success: true})
        }
      })
  } else {
    return res.status(401).json('unathorized');
  } 
}

module.exports = {
    handleSignout: handleSignout
}