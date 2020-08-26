const handleSignout = (redisClient) => (req, res) => {
    const { authorization } = req.headers;
    return redisClient.del(authorization, (err, reply) => {
      if (err || !reply) {
        return res.status(400).json('unauthorized')
      }
      else {
        return res.json({success: true})
      }
    });
}

module.exports = {
    handleSignout: handleSignout
}