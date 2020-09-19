const requireAuth = (redisClient) =>  (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization.includes('Bearer')) {
        const token = authorization.slice(7,authorization.length);
        if (!token) {
            return res.status(401).json('unauthorized')
        }
        return redisClient.get(token, (err, reply) => {
            if (err || !reply) {
                return res.status(401).json('unathorized')
            }
            return next()
        })
    } else {
        return res.status(401).json('unathorized');
    }
}

module.exports = {
    requireAuth: requireAuth
}