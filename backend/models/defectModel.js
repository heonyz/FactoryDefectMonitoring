const client = require('../services/redisClient');

async function getAllDefects(connection) {
    const cacheKey = 'defects:all';
    const cachedDefects = await client.get(cacheKey);

    if (cachedDefects) {
        return JSON.parse(cachedDefects);
    }

    const query = 'SELECT * FROM defects';
    const [defects] = await connection.query(query);

    if (defects.length) {
        await client.setEx(cacheKey, 3600, JSON.stringify(defects)); // 1시간 캐싱
    }

    return defects;
}

module.exports = { getAllDefects };
