const express = require('express');
const cors = require('cors');
var knex = require('knex');
const bcrypt = require('bcrypt');
const register = require('./controllers/Register.js');
const signin = require('./controllers/SignIn.js');
const profile = require('./controllers/Profile.js');
const image = require('./controllers/Image.js');

const postgres = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'Ksu',
      password : '1111',
      database : 'smart-brain'
    }
  });

const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => res.send('app works'));
app.post('/signin', signin.handleSignIn(postgres, bcrypt));
app.post('/register', register.handleRegister(postgres, bcrypt));
app.get('/profile/:id', profile.profileRequest(postgres));
app.put('/rank', image.handleRankRequest(postgres));
app.post('/imageRecognition', image.handleImageRecognition);
const PORT = process.env.PORT; 
app.listen(PORT, () => {
    console.log(`server listens on port ${PORT}`);
});

/*
/ -> res = this works
/signin -> POST = success/fail
/reqister -> POST = user
/profile/:userId -> GET = user
/image -> PUT  -> user
*/