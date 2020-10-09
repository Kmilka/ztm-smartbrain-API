const mailing = require('./SendMail.js');

const signToken = (email, jwt, JWTSECRET) => {
    return jwt.sign({ email }, JWTSECRET, { expiresIn: '1h' } )
}

const setToken = (redisClient, key, value) => {
    redisClient.set(key, value);
    redisClient.expire(key, 3600);
}

const verifyPasswordToken = (redisClient, jwt, JWTSECRET) => {
    const { token } = req.params;
    if (!token) {
        return Promise.reject('bad request')
    }
    jwt.verify(token, JWTSECRET, (err) => {
        if (err) {
            return Promise.reject('token has expired')
        }
    });
    return redisClient.get(token, (err, getReply) => {
        if (err) {
            return Promise.reject('no such token')
        }
        else {
            redisClient.del(token, (err, reply) => {
                if (err || !reply) {
                  return Promise.reject('token was not deleted. cant continue')
                }
                else {
                  return Promise.resolve({id: getReply})
                }
            })
        }
    });
}

const initiatePasswordReset = (postgres, redisClient, jwt, JWTSECRET, CLIENTURL) => (req, res) => {
    
    const { email } = req.body;
    if (!email) {
        return Promise.reject('incorrect email address');
    }
    
    const generatePasswordResetLink = (id) => {
        const token = signToken(email, jwt, JWTSECRET);
        setToken(redisClient, token, id);
        return `${CLIENTURL}password-reset/token/${token}`;
    }

    const isUserRegistered = () => {
        return postgres
            .select('*')
            .from('users')
            .where('email', '=', email)
            .then(data => data)
            .catch(console.log);
    }

    const user = isUserRegistered();
    const link = user.length ? generatePasswordResetLink(user[0].id) : null;
    return mailing.createMessage(email, link)
        .then(() => res.status(200))
        .catch(err => {
            console.log(err);
            res.status(400).json('some error ocurred while email was created')
        })
}



const handlePasswordReset = (postgres, bcrypt, redisClient, jwt, JWTSECRET) => (req, res) => {
    const { id, password } = req.body;
    if (!id || !password) {
        return Promise.reject('incorrect form submission');
    }
    const putNewPasswordInDB = (userId) => {
        const saltRounds = 10; // increase this if you want more iterations
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        
        return postgres('login')
        .where('id', '=', userId)
        .update( 'hash', hash)
        .then(status => {
            if (status === [1]) {
                return Promise.resolve('password updated')
            } else {
                throw new Error('server error while updating password')
            }
        })
        .catch(err => Promise.reject(err))
    }

    verifyPasswordToken(redisClient, jwt, JWTSECRET)
    .then(userId => putNewPasswordInDB(userId))
    .then(() => res.status(200))
    .catch(err => res.status(400).json(err))
}

module.exports = {
    initiatePasswordReset: initiatePasswordReset,
    handlePasswordReset: handlePasswordReset
}