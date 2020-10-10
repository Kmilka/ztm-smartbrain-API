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


const verifyToken = (jwt, JWTSECRET, token) => {
    if (!token) {
        throw new Error ('bad request')
    }
    return jwt.verify(token, JWTSECRET)
}

async function changePassword (postgres, bcrypt, redisClient, password, token) {
    return redisClient.get(token, (err, reply) => {
        if (err) {
            console.log(err, 'err')
            throw new Error(err)
        } else {
            redisClient.del(token);
            return putNewPasswordInDB(reply, password, postgres, bcrypt)
        }
})
}

const putNewPasswordInDB = (id, password, postgres, bcrypt ) => {
    const saltRounds = 10; // increase this if you want more iterations
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return postgres('login')
    .where('id', '=', id)
    .update( 'hash', hash)
    .then(status => {
        if (status === [1]) {
            return {success: true}
        } else {
            return {success: false}
        }
    })
    .catch(err => Promise.reject(err))
}

const handlePasswordReset = (postgres, bcrypt, redisClient, jwt, JWTSECRET) => (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json('incorrect form submission')
    }

    verifyToken(jwt, JWTSECRET, token);
    return changePassword(postgres, bcrypt, redisClient, password, token)
        .then(status => {
            if (status) {
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
    handlePasswordReset: handlePasswordReset
}