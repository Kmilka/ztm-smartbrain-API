const express = require("express");
const cors = require("cors");
const knex = require("knex");
const bcrypt = require("bcrypt");
const register = require("./controllers/Register.js");
const signin = require("./controllers/SignIn.js");
const signout = require("./controllers/SignOut.js");
const profile = require("./controllers/Profile.js");
const image = require("./controllers/Image.js");
const auth = require("./controllers/Authorization.js")
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
require('dotenv').config();
const redis = require('redis');
const compression = require('compression');

const redisClient = redis.createClient({ host: 'redis' });

const postgres =  knex({
  client: "pg",
  connection: {
    host: 'smpostgres',
    user: 'postgres',
    password: '',
    database: 'postgres'
  }
});

const {JWTSECRET, PORT} = process.env;

const app = express();
app.use(express.json());
app.use(compression());
app.use(helmet());

let corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS']
}
app.use(cors(corsOptions));

app.post("/signin", signin.signinAuthentication(postgres, bcrypt, redisClient, jwt, JWTSECRET));
app.post("/register", register.registerAuthentication(postgres, bcrypt, redisClient, jwt, JWTSECRET));
app.get("/signout", signout.handleSignout(redisClient));
app.get("/profile/:id", auth.requireAuth(redisClient), profile.handleRequest(postgres));
app.post("/profile/:id", auth.requireAuth(redisClient), profile.handleUpdate(postgres));
app.get("/profile/:id/rank", auth.requireAuth(redisClient), profile.handleRankRequest(postgres));
app.post("/imageRecognition", auth.requireAuth(redisClient), image.handleImageRecognition(postgres));

app.listen(PORT, () => {});