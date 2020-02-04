const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');


const saltRounds = 10 // increase this if you want more iterations  
const userPassword = 'supersecretpassword'  
const randomPassword = 'fakepassword'

const app = express();
app.use(express.json());
app.use(cors());

const database = {
    users: [
        {
            id: '1',
            name: 'John',
            email: 'JohnDoe@invalid.com',
            hash: '$2b$10$oIhzzK5fgdN4s.1Z.dM2juAfEP041e241sD2bohaBUSeUR3QBZ6k.',
            entries: 0,
            joined: new Date()
        },
        {
            id: '2',
            name: 'Sally',
            email: 'SallyDoe@invalid.com',
            hash: 'biscuits',
            entries: 0,
            joined: new Date()
        }
    ]
}

app.get('/', (req, res) => {
    res.json(database.users);
})

app.post('/signin', (req, res) => {
    let successSignIn = false;
    database.users.forEach((user) => {
        if ( req.body.email === user.email && bcrypt.compareSync(req.body.password, user.hash)) {
            successSignIn = true;
           return res.json('success');
        }})
    if (!successSignIn)
        res.status(400).json('error logging in');
    })

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;

    var salt = bcrypt.genSaltSync(saltRounds);
    var hash = bcrypt.hashSync(password, salt);

    database.users.push(
        {
            id: '200',
            name: name,
            email: email,
            hash: hash,
            entries: 0,
            joined: new Date()
        }
    );
    res.json(database.users[database.users.length-1]);
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    database.users.forEach( user => {
        if (user.id === id) {
            found = true;
            return res.json(user);
    }})
    if (!found) {
        res.status(400).json('Not found');
    }
})

app.put('/image', (req, res) => {
    const { id } = req.body;
    let found = false;
    database.users.forEach( user => {
        if (user.id === id) {
            found = true;
            user.entries++;
            return res.json(user.entries);
    }})
    if (!found) {
        res.status(400).json('Not found');
    }
})

app.listen(4000, () => {
    console.log('app is running on port 4000')
});

/*
/ -> res = this works
/signin -> POST = success/fail
/reqister -> POST = user
/profile/:userId -> GET = user
/image -> PUT  -> user
*/