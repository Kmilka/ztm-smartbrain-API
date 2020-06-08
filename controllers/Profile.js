const profileRequest = (postgres) => (req, res) => {
  const { id } = req.params;
  postgres
    .select("*")
    .from("users")
    .where({ id })
    .then((user) => {
      if (user.length) {
        {
        }
        res.status(400).json("not found");
      } else res.json(user);
    })
    .catch((err) => res.status(400).json("error fetching user"));
};

module.exports = {
  profileRequest: profileRequest,
};
