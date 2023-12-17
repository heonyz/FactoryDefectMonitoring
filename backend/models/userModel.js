/**
 * 사용자 추가
 * @param {object} connection - MySQL 연결 객체
 * @param {object} userData - 사용자 데이터
 * @param {string} userData.name - 이름
 * @param {string} userData.email - 이메일
 * @param {string} userData.username - 사용자 이름
 * @param {string} userData.password - 비밀번호
 * @param {string} userData.address - 주소
 * @param {string} userData.phone - 전화번호
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
}

/**
 * 사용자 정보 가져오기 (username 기준)
 * @param {object} connection - MySQL 연결 객체
 * @param {string} username - 사용자 이름
 * @returns {object} 사용자 정보
 */

async function getUserByUsername(connection, username) {
    const query = `SELECT * FROM users WHERE username = ?`;
    const [results] = await connection.query(query, [username]);
    return results.length ? results[0] : null;
}

/**
 * 사용자 정보 가져오기 (ID 기준)
 * @param {object} connection - MySQL 연결 객체
 * @param {number} userId - 사용자 ID
 * @returns {object} 사용자 정보
 */



async function getUserById(connection, userId) {
    const query = `SELECT * FROM users WHERE id = ?`;
    const [results] = await connection.query(query, [userId]);
    return results.length ? results[0] : null;
}

module.exports = {
    addUser,
    getUserByUsername,
    getUserById,
};
