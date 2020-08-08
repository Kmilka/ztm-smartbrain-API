const express = require("express");
const cors = require("cors");
var knex = require("knex");
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const register = require("./controllers/Register.js");
const signin = require("./controllers/SignIn.js");
const profile = require("./controllers/Profile.js");
const image = require("./controllers/Image.js");

require('dotenv').config();

const postgres = knex({
  client: "pg",
  connection: {
    host: 'smpostgres',
    user: 'postgres',
    password: '',
    database: 'postgres'
  }
});


const app = express();
app.use(express.json());
app.use(morgan('combined'));

app.use(cors());
app.post("/signin", signin.handleSignIn(postgres, bcrypt));
app.post("/register", register.handleRegister(postgres, bcrypt));
app.get("/profile/:id", profile.profileRequest(postgres));
app.put("/rank", image.handleRankRequest(postgres));
app.post("/imageRecognition", image.handleImageRecognition);

app.listen(process.env.MY_PORT, () => {});

postgres.select("*").from("users").then(data => console.log(data))
.catch(err => console.log(err))

/*
/ -> res = this works
/signin -> POST = success/fail
/reqister -> POST = user
/profile/:userId -> GET = user
/image -> PUT  -> user
*/
