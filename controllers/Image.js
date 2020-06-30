const clarifai = require("clarifai");

require('dotenv').config();

const app = new Clarifai.App({
  apiKey: process.env.CLARIFAI_APIKEY,
});

let successfulImageRecognition = true;

const handleImageRecognition = (req, res) => {
  successfulImageRecognition = true;
  const { input } = req.body;
  app.models
    .predict("a403429f2ddf4b49b307e318f00e528b", input)
    .then((response) => res.json(response))
    .catch((err) => {
      res.status(400).json(`this image can't be processed. check the link!`)
      successfulImageRecognition = false;
    });
};

const handleRankRequest = (postgres) => (req, res) => {
    const { id } = req.body;
    if (successfulImageRecognition) {
      postgres('users')
      .where({ id })
      .select("entries")
      .increment('entries', 1)
    }
    postgres("users")
    .where({ id })
    .select("entries")
    .then((data) => res.json(data[0]))
    .catch((err) => res.status(400).json("unable to get entries"));
};

module.exports = {
  handleRankRequest: handleRankRequest,
  handleImageRecognition: handleImageRecognition,
};