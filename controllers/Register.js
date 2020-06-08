const handleRegister = (postgres, bcrypt) => (req, res) => {
  const saltRounds = 10; // increase this if you want more iterations
  const { email, name, password } = req.body;

  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);

  if (!email || !name || !password) {
    return res.status(400).json("incorrect form submission");
  }

  postgres
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
            .then((response) => {
              res.json(response[0]);
            })
            .catch((err) => res.status(400).json("unable to register"));
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch((err) => res.status(400).json("transaction failed"));
};

module.exports = {
  handleRegister: handleRegister,
};
