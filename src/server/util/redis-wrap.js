const crypto = require('crypto');
const newRedisClient = require('./redis');
const pify = require('pify');

const defaultTTL = 5 * 60 * 1000;

module.exports = (fn, TTL = defaultTTL) => {
  const fnHash = crypto.createHash('md5').update(fn.toString()).digest('hex');

  return async (...args) => {
    const redis = newRedisClient(fnHash);
    let cachedReturn = await pify(redis.get.bind(redis))(JSON.stringify(args));
    if (cachedReturn !== null) cachedReturn = JSON.parse(cachedReturn);

    if (process.env.NODE_ENV !== 'production' || cachedReturn === null || cachedReturn.expires <= Date.now()) {
      const returnValue = await Promise.resolve(fn(...args));
      redis.set(JSON.stringify(args), JSON.stringify({
        returnValue,
        expires: Date.now() + TTL,
      }));
      return returnValue;
    } else {
      return cachedReturn.returnValue;
    }
  };
}