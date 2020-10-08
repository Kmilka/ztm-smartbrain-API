const express = require('express');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
require('dotenv').config();
const redis = require('redis');
const compression = require('compression');
const register = require('./controllers/Register.js');
const signin = require('./controllers/SignIn.js');
const signout = require('./controllers/SignOut.js');
const profile = require('./controllers/Profile.js');
const image = require('./controllers/Image.js');
const auth = require('./controllers/Authorization.js');
const passwordReset = require('./controllers/passwordReset/PasswordReset.js')

const redisClient = redis.createClient(process.env.REDIS_URL);

const postgres =  knex({
  client: 'pg',
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const {JWTSECRET, PORT, CLIENTURL} = process.env;

const app = express();
app.use(express.json());
app.use(compression());
app.use(helmet());

let corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS']
}
app.use(cors(corsOptions));

app.post('/signin', signin.signinAuthentication(postgres, bcrypt, redisClient, jwt, JWTSECRET));
app.post('/register', register.registerAuthentication(postgres, bcrypt, redisClient, jwt, JWTSECRET));
app.get('/signout', signout.handleSignout(redisClient));
app.get('/profile/:id', auth.requireAuth(redisClient, jwt, JWTSECRET), profile.handleRequest(postgres));
app.post('/profile/:id', auth.requireAuth(redisClient, jwt, JWTSECRET), profile.handleUpdate(postgres));
app.get('/profile/:id/rank', auth.requireAuth(redisClient, jwt, JWTSECRET), profile.handleRankRequest(postgres));
app.post('/imageRecognition', auth.requireAuth(redisClient, jwt, JWTSECRET), image.handleImageRecognition(postgres));
app.post('/password', passwordReset.initiatePasswordReset(postgres, redisClient, jwt, JWTSECRET, CLIENTURL));
app.post('/password/new', passwordReset.handlePasswordReset(postgres, bcrypt, redisClient, jwt, JWTSECRET));

app.listen(PORT, () => {});