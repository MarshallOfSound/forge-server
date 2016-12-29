const redis = require('redis');

const REDIS_HOST = process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.01';
const REDIS_PORT = process.env.REDIS_PORT_6379_TCP_PORT || 6379;

module.exports = (prefix) => redis.createClient(REDIS_PORT, REDIS_HOST, { prefix });