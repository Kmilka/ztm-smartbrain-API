const clarifai = require("clarifai");

const app = new Clarifai.App({
  apiKey: "ab458a397ea04ced85ac5e40ca74b2dd",
});

const handleImageRecognition = (req, res) => {
  const { input } = req.body;
  app.models
    .predict("a403429f2ddf4b49b307e318f00e528b", input)
    .then((response) => res.json(response))
    .catch((err) => res.status(400).json(`this image can't be processed`));
};

const handleRankRequest = (postgres) => (req, res) => {
  const { id } = req.body;

  postgres
    .select("*")
    .from("users")
    .where({ id })
    .increment("entries", 1)
    .returning("entries")
    .then((data) => res.json(data[0]))
    .catch((err) => res.status(400).json("unable to get entries"));
};

module.exports = {
  handleRankRequest: handleRankRequest,
  handleImageRecognition: handleImageRecognition,
};
