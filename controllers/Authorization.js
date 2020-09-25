const requireAuth = (redisClient, jwt, JWTSECRET) =>  (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization.includes('Bearer')) {
        const token = authorization.slice(7,authorization.length);
        if (!token) {
            return res.status(401).json('unauthorized')
        }
        jwt.verify(token, JWTSECRET, (err) => {
            if (err) {
                return res.status(401).json('unauthorized')
            }
        });
        redisClient.get(token, (err) => {
            if (err) {
                return res.status(401).json('unathorized')
            }
        })
    } else {
        return res.status(401).json('unathorized');
    }
    return next();
}

module.exports = {
    requireAuth: requireAuth
}