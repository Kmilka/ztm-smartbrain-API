const express = require('express');
const cors = require('cors');

var knex = require('knex');

const postgres = knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'Ksu',
      password : '1111',
      database : 'smart-brain'
    }
  });

const bcrypt = require('bcrypt');
const saltRounds = 10 // increase this if you want more iterations  

const app = express();
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.status(200).json('server responds');
})

app.post('/signin', (req, res) => {
    postgres.select('email', 'hash').from('login')
    .where('email', '=', req.body.email)
    .then(data => {
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash)
        if (isValid) {
            return postgres.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(users => res.json(users[0]))   
            .catch(err => res.status(400).json('unable to get user'));       
        }
        else {
            res.status(400).json('wrong credentials');
        }
    })
    .catch(err => res.status(400).json('wrong credentials'));
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;

    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(password, salt);

    postgres.transaction(trx => {
        trx.insert({
            email: email,
            hash: hash
        }).into('login')
        .returning('email')
        .then(loginEmail => {
            return trx('users')
            .returning('*')
            .insert({
                    name: name,
                    email: loginEmail[0],
                    joined: new Date()
            })
            .then(response => {
                res.json(response[0]);
            })
            .catch(err => res.status(400).json('unable to register'));
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch(err => res.status(400).json('transaction failed'));

})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    postgres.select('*').from('users').where({id})
    .then(user => {
        if (user.length) { {}
            res.status(400).json('not found');
        }
        else
            res.json(user)}
        )
    .catch(err => res.status(400).json('error fetching user'));
});

app.put('/image', (req, res) => {

    const { id } = req.body;

    postgres.select('*').from('users').where({id})
    .increment('entries', 1)
    .returning('entries')
    .then(data => {
        res.json(data[0])})
    .catch(err => res.status(400).json('unable to get entries'));

})

app.listen(4000);

/*
/ -> res = this works
/signin -> POST = success/fail
/reqister -> POST = user
/profile/:userId -> GET = user
/image -> PUT  -> user
*/