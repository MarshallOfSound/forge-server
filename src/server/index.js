const apicache = require('apicache');
const bodyparser = require('body-parser');
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const mysql = require('./util/mysql');
const updateRouter = require('./update');
const newRedisClient = require('./util/redis');

const app = express();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded());

if (process.env.NODE_ENV === 'production') {
  app.use('/update', apicache.options({
    redisClient: newRedisClient('express-cache'),
  }).middleware('10 minutes'), updateRouter);
} else {
  app.use('/update', updateRouter);
}

app.use('/', express.static(path.resolve(__dirname, '../public')));

const CLIENT_ID = 'e1c4e43443a162ec86be';
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

let signupID = 1;
const signups = {};
app.get('/signup/callback', (req, res) => {
  if (req.query.code) {
    fetch(`https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${req.query.code}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
    .then(r => r.json())
    .then((resp) => {
      signupID += 1;
      signups[`${signupID}`] = resp.access_token;
      res.redirect(`/signup/choose?signup_id=${signupID}`);
    })
    .catch(() => res.redirect('/signup'));
  } else {
    res.redirect('/signup');
  }
});

app.post('/signup/choose/submit', (req, res) => {
  const { signupID, owner, name } = req.body;
  if (signupID && owner && name && signups[signupID]) {
    mysql.query('INSERT INTO `repos` (`owner`, `name`, `token`) VALUES (?, ?, ?)', [owner, name, signups[signupID]], (err, results) => {
      delete signups[signupID];
      res.redirect('/signup/success');
    });
  } else {
    res.redirect('/');
  }
});

app.listen(3000, () => {
  console.log('Forge Update Server Launched');
});

process.on('unhandledRejection', (err) => {
  console.error('WOOPS!!!!\n\n', err.message, '\n', err.stack);
});

app.use((err, req, res, next) => {
  res.status(500).json({
    error: true,
    message: 'Unknown error occurred',
  });
});