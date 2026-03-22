const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes default

const getCache = (key) => cache.get(key);
const setCache = (key, value, ttl = 600) => cache.set(key, value, ttl);
const delCache = (key) => cache.del(key);
const flushCache = () => cache.flushAll();

module.exports = { getCache, setCache, delCache, flushCache };