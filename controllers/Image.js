const clarifai = require("clarifai");

require('dotenv').config();

const app = new Clarifai.App({
  apiKey: process.env.CLARIFAI_APIKEY,
});

const handleImageRecognition = (postgres) => (req, res) => {
  const {input, id} = req.body;
  app.models
    .predict("a403429f2ddf4b49b307e318f00e528b", input)
    .then(data => {
      if (Object.keys(data.outputs[0].data).length !== 0) {
        updateUserEntries(postgres, id);
      }
      return res.json(data)
    })
    .catch(() => {
      res.status(400).json(`This image can't be processed`);
    })
};

const updateUserEntries = (postgres, id) => {
  postgres('users')
  .where({id})
  .select('entries')
  .increment('entries', 1)
  .then(() => {})
  .catch(err => console.log(err))
}

module.exports = {
  handleImageRecognition: handleImageRecognition,
};