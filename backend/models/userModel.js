const client = require('../services/redisClient');

/**
 * 사용자 추가 (DB에 삽입 후 캐시 삭제)
 * @param {object} connection - MySQL 연결 객체
 * @param {object} userData - 사용자 데이터
 */
async function addUser(connection, userData) {
    const query = `
        INSERT INTO users (name, email, username, password, address, phone)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [
        userData.name,
        userData.email,
        userData.username,
        userData.password,
        userData.address,
        userData.phone,
    ];
    await connection.query(query, values);

    // 사용자 추가 후 Redis 캐시 삭제
    await client.del(`user:${userData.username}`);
}

/**
 * 사용자 정보 가져오기 (username 기준, Redis 캐싱 적용)
 * @param {object} connection - MySQL 연결 객체
 * @param {string} username - 사용자 이름
 * @returns {object} 사용자 정보
 */
async function getUserByUsername(connection, username) {
    const cacheKey = `user:${username}`;
    
    // Redis에서 먼저 조회
    const cachedUser = await client.get(cacheKey);
    if (cachedUser) {
        return JSON.parse(cachedUser);
    }

    // 캐시에 없으면 DB 조회
    const query = `SELECT * FROM users WHERE username = ?`;
    const [results] = await connection.query(query, [username]);
    const user = results.length ? results[0] : null;

    // 조회된 데이터가 있다면 Redis에 캐싱 (TTL: 1시간)
    if (user) {
        await client.setEx(cacheKey, 3600, JSON.stringify(user));
    }

    return user;
}

/**
 * 사용자 정보 가져오기 (ID 기준, Redis 캐싱 적용)
 * @param {object} connection - MySQL 연결 객체
 * @param {number} userId - 사용자 ID
 * @returns {object} 사용자 정보
 */
async function getUserById(connection, userId) {
    const cacheKey = `user:id:${userId}`;
    
    // Redis에서 먼저 조회
    const cachedUser = await client.get(cacheKey);
    if (cachedUser) {
        return JSON.parse(cachedUser);
    }

    // 캐시에 없으면 DB 조회
    const query = `SELECT * FROM users WHERE id = ?`;
    const [results] = await connection.query(query, [userId]);
    const user = results.length ? results[0] : null;

    // 조회된 데이터가 있다면 Redis에 캐싱 (TTL: 1시간)
    if (user) {
        await client.setEx(cacheKey, 3600, JSON.stringify(user));
    }

    return user;
}

module.exports = {
    addUser,
    getUserByUsername,
    getUserById,
};
