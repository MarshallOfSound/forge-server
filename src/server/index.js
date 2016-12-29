const apicache = require('apicache');
const bodyparser = require('body-parser');
const express = require('express');
const path = require('path');

const updateRouter = require('./update');
const newRedisClient = require('./util/redis');

const app = express();

app.use(bodyparser.json());

if (process.env.NODE_ENV === 'production') {
  app.use('/update', apicache.options({
    redisClient: newRedisClient('express-cache'),
  }).middleware('10 minutes'), updateRouter);
} else {
  app.use('/update', updateRouter);
}

app.use('/', express.static(path.resolve(__dirname, '../public')));

app.listen(3000, () => {
  console.log('Forge Update Server Launched');
});

process.on('unhandledRejection', (err) => {
  console.error('WOOPS!!!!\n\n', err.message, '\n', err.stack);
});