const client = require('../services/redisClient');

async function getAllDevices(connection, userId) {
    const cacheKey = `devices:${userId}`;
    const cachedDevices = await client.get(cacheKey);

    if (cachedDevices) {
        return JSON.parse(cachedDevices);
    }

    const query = 'SELECT * FROM devices WHERE user_id = ?';
    const [devices] = await connection.query(query, [userId]);

    if (devices.length) {
        await client.setEx(cacheKey, 1800, JSON.stringify(devices)); // 30분 캐싱
    }

    return devices;
}

module.exports = { getAllDevices };
