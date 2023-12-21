const pool = require('../config/db'); // DB 연결
const client = require('./redisClient');

async function executeTransaction(queryFunction) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await queryFunction(connection);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function cacheQuery(key, ttl, queryFunction) {
    const cachedData = await client.get(key);
    if (cachedData) {
        return JSON.parse(cachedData);
    }

    const data = await queryFunction();
    await client.setEx(key, ttl, JSON.stringify(data)); // 캐싱 (예: 3600초)
    return data;
}

module.exports = { executeTransaction, cacheQuery };
