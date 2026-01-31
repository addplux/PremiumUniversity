const redis = require('redis');
const logger = require('../util/logger');

let client;

if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    client = redis.createClient({
        url: process.env.REDIS_URL
    });

    client.on('error', (err) => logger.error('Redis Client Error', err));

    (async () => {
        try {
            await client.connect();
            logger.info('Connected to Redis');
        } catch (err) {
            logger.error('Failed to connect to Redis', err);
        }
    })();
}

const cache = (duration) => {
    return async (req, res, next) => {
        // Skip caching if Redis is not connected (e.g. dev mode without redis)
        if (!client || !client.isOpen) {
            return next();
        }

        // Key based on URL + Tenant (if applicable)
        const key = `__express__${req.originalUrl || req.url}`;

        try {
            const cachedBody = await client.get(key);
            if (cachedBody) {
                res.send(JSON.parse(cachedBody));
                return;
            } else {
                res.sendResponse = res.send;
                res.send = (body) => {
                    client.setEx(key, duration, JSON.stringify(body));
                    res.sendResponse(body);
                };
                next();
            }
        } catch (err) {
            logger.error('Redis Cache Error', err);
            next();
        }
    };
};

module.exports = cache;
