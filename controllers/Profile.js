const handleRequest = (postgres) => (req, res) => {
  const { id } = req.params;
  postgres
    .select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        res.json(user);
      } else {
        res.status(400).json("not found");
      };
    })
    .catch((err) => res.status(400).json("error fetching user"));
  };
  
  const handleUpdate = (postgres) => (req, res) => {
    const { id } = req.params;
    const { name, age, pet } = req.body.formInput;
    postgres
      .from("users")
      .where({ id })
      .update({ name, age, pet })
      .then(response => {
        if (response) {
          res.json("success")
        }
        else return res.status(400).json("unable to update")
      })
      .catch(err => console.log(err))
  }

  const handleRankRequest = (postgres) => (req, res) => {
    const { id } = req.params;
    postgres("users")
    .where({ id })
    .select("entries")
    .then(data => res.json(data[0]))
    .catch(err => {
      console.log(err)
      res.status(400).json("unable to get entries")});
};

module.exports = {
  handleRequest: handleRequest,
  handleUpdate: handleUpdate,
  handleRankRequest: handleRankRequest
};
