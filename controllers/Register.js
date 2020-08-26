const handleRegister = (postgres, bcrypt, req) => {
  const saltRounds = 10; // increase this if you want more iterations
  const { email, name, password } = req.body;

  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  if (!email || !name || !password) {
    return Promise.reject("incorrect form submission");
  }

  return postgres
    .transaction((trx) => {
      trx
        .insert({
          email: email,
          hash: hash,
        })
        .into("login")
        .returning("email")
        .then((loginEmail) => {
          return trx("users")
            .returning("*")
            .insert({
              name: name,
              email: loginEmail[0],
              joined: new Date(),
            })
            .then(user => user[0])
            .catch(err => Promise.reject("unable to register now. try later"));
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .then(user => {
      return user})
    .catch(err => Promise.reject("can't register with provided credentials"));
};

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

const registerAuthentication =  (postgres, bcrypt, redisClient, jwt, JWTSECRET) => (req, res) => {
  return handleRegister(postgres, bcrypt, req)
      .then(user => {
        return user.id && user.email ? createSession(user, redisClient, jwt, JWTSECRET) : Promise.reject("incorrect form submission")
      })
      .then(session => {
        res.json(session)
      })
      .catch(err => {
        res.status(400).json(err)
      })
}

module.exports = {
  registerAuthentication: registerAuthentication,
};
