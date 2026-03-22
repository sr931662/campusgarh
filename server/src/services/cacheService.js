const redis = require('redis');

class CacheService {
  constructor() {
    this.client = redis.createClient({
      url: process.env.REDIS_URL,
    });
    this.client.on('error', (err) => console.error('Redis error:', err));
    this.client.connect();
  }

  async get(key) {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttl = 3600) {
    await this.client.setEx(key, ttl, JSON.stringify(value));
  }

  async del(key) {
    await this.client.del(key);
  }

  async clearPattern(pattern) {
    const keys = await this.client.keys(pattern);
    if (keys.length) await this.client.del(keys);
  }
}

module.exports = new CacheService();