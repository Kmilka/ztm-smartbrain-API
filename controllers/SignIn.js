const handleSignIn = (postgres, bcrypt, req) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return Promise.reject("incorrect form submission");
  }

  console.log(req.body)

  return postgres
    .select("email", "hash")
    .from("login")
    .where("email", "=", email)
    .then((data) => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return postgres
          .select("*")
          .from("users")
          .where("email", "=", email)
          .then(user => user[0])
          .catch(err => Promise.reject("unable to get user"));
      } else {
        throw new Error ("wrong credentials")
      }
    })
    .then(user => user)
    .catch(err => Promise.reject("wrong credentials"));
};

const getAuthTokenId = (redisClient, jwt, JWTSECRET, req, res) => {
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
    return redisClient.get(token, (err, reply) => {
      if (err) {
        return res.status(400).json('unauthorized')
      }
      else {
        return res.json({id: reply})
      }
    });
  }
  else {
    return res.status(400).json('unauthorized')
  } 
}

const setToken = (redisClient, key, value) => {
  return Promise.resolve(redisClient.set(key, value));
}

const createSession = (user, redisClient, jwt, JWTSECRET) => {
  //create token and return user data 
  const { email, id } = user;
  const token = signToken(email, jwt, JWTSECRET);
  return setToken(redisClient, token, id)
    .then(() => {
      return {success: true, id, token}
    })
    .catch(console.log);
}

const signToken = (email, jwt, JWTSECRET) => {
  return jwt.sign({ email }, JWTSECRET, { expiresIn: '12h' } )
}

const signinAuthentication =  (postgres, bcrypt, redisClient, jwt, JWTSECRET ) => (req, res) => {
  const { authorization } = req.headers;
  return authorization ?
    getAuthTokenId(redisClient, jwt, JWTSECRET, req, res) :
    handleSignIn(postgres, bcrypt, req, res)
      .then(user => {
        return user.id && user.email ? createSession(user, redisClient, jwt, JWTSECRET) : Promise.reject("incorrect form submission")
      })
      .then(session => res.json(session))
      .catch(err => res.status(400).json(err))
}

module.exports = {
  signinAuthentication: signinAuthentication
};
