const requireAuth = (redisClient) =>  (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization.includes('Bearer')) {
        const token = authorization.slice(7,authorization.length);
        if (!token) {
            return res.status(401).json('there is no token')
        }
        return redisClient.get(token, (err, reply) => {
            if (err || !reply) {
                return res.status(401).json('err or no reply from redis')
            }
            return next()
        })
    } else {
        return res.status(401).json('no bearer');
    }
}

module.exports = {
    requireAuth: requireAuth
}