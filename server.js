const express = require("express");
const cors = require("cors");
var knex = require("knex");
const bcrypt = require("bcrypt");
const register = require("./controllers/Register.js");
const signin = require("./controllers/SignIn.js");
const signout = require("./controllers/SignOut.js");
const profile = require("./controllers/Profile.js");
const image = require("./controllers/Image.js");
const auth = require("./controllers/Authorization.js")
const jwt = require('jsonwebtoken');
require('dotenv').config();
const redis = require('redis');
const compression = require('compression');

const redisClient = redis.createClient(process.env.REDIS_URL);

const postgres = knex({
  client: "pg",
  connection: process.env.DATABASE_URL ,
  ssl: {
    rejectUnauthorized: false
  }
});

const {JWTSECRET, PORT} = process.env;

const app = express();
app.use(express.json());
app.use(compression());

let whitelist = ['https://polar-mountain-93670.herokuapp.com']
let corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  
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