const express = require("express");
const cors = require("cors");
var knex = require("knex");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const register = require("./controllers/Register.js");
const signin = require("./controllers/SignIn.js");
const profile = require("./controllers/Profile.js");
const image = require("./controllers/Image.js");

dotenv.config();

const postgres = knex({
  client: "pg",
  connection: {
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'postgres' 
  }
});

const app = express();
app.use(express.json());
app.use(cors());
app.post("/signin", signin.handleSignIn(postgres, bcrypt));
app.post("/register", register.handleRegister(postgres, bcrypt));
app.get("/profile/:id", profile.profileRequest(postgres));
app.put("/rank", image.handleRankRequest(postgres));
app.post("/imageRecognition", image.handleImageRecognition);

app.listen(process.env.MY_PORT, () => {});

/*
/ -> res = this works
/signin -> POST = success/fail
/reqister -> POST = user
/profile/:userId -> GET = user
/image -> PUT  -> user
*/
