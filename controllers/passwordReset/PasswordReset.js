const mailing = require('./SendMail.js');

const signToken = (email, jwt, JWTSECRET) => {
    return jwt.sign({ email }, JWTSECRET, { expiresIn: '1h' } )
}

const setToken = (redisClient, key, value) => {
    redisClient.set(key, value);
    redisClient.expire(key, 3600);
}

const generatePasswordResetLink = (id, email, jwt, JWTSECRET, CLIENTURL, redisClient) => {
    const token = signToken(email, jwt, JWTSECRET);
    setToken(redisClient, token, id);
    return `${CLIENTURL}password-reset/token/${token}`;
}

const isUserRegistered = (postgres, email) => {
    return postgres
    .select('id')
    .from('users')
    .where('email', '=', email)
        .then(user => {
            if (user.length) {
                return user[0].id;
            } else {
                return null
            }
        })
        .catch(() => Promise.reject('database error'));
}

const initiatePasswordReset = (postgres, redisClient, jwt, JWTSECRET, CLIENTURL) => (req, res) => {
    
    const { email } = req.body;
    if (!email) {
        return Promise.reject('incorrect email address');
    }

    let passwordResetLink = null;
    
    return isUserRegistered(postgres, email)
    .then(id => {
        if (id) {
            passwordResetLink = generatePasswordResetLink(id, email, jwt, JWTSECRET, CLIENTURL, redisClient)
        }
    })
    .then(() => {
        if (passwordResetLink) {
            mailing.createMessage(email, passwordResetLink)
        } else {
            mailing.createMessage(email)
        }
    })
    .then(() => res.status(200).json('email was sent'))
    .catch(err => {
        res.status(400).json(err)
    })
}

const verifyToken = (jwt, JWTSECRET, redisClient) => (req, res) => {
    const { token } = req.params;
    if (!token) {
        return res.status(400).json('Token was not provided')
    }

    jwt.verify(token, JWTSECRET);
    return redisClient.get(token, (err, reply) => {
        if (err || !reply) {
            res.status(400).json('Token was used')
        } else {
            redisClient.del(token);
            return res.status(200).json(reply);
        }
    })

}

const putNewPasswordInDB = (id, password, postgres, bcrypt ) => {
    const saltRounds = 10; // increase this if you want more iterations
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return postgres('login')
    .where('id', '=', id)
    .update('hash', hash)
    .then(status => {
        if (status === 1) {
            return {success: true}
        } else {
            return {success: false}
        }
    })
    .catch(err => Promise.reject('password was not updated'))
}

const handlePasswordReset = (postgres, bcrypt) => (req, res) => {
    const { id, password } = req.body;
    if (!id || !password) {
        return res.status(400).json('incorrect form submission')
    }

    return putNewPasswordInDB(id, password, postgres, bcrypt)
        .then(result => {
            if (result.success) {
                res.status(200).json('password was updated')
            } else {
                res.status(400).json('update failed')
            }
        })
        .catch(err => {
            res.status(400).json(err)
        })
}

module.exports = {
    initiatePasswordReset: initiatePasswordReset,
    handlePasswordReset: handlePasswordReset,
    verifyToken: verifyToken
}