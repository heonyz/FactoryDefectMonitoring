// Device 관련 DB 로직
async function getAllDevices(connection, userId) {
    const query = 'SELECT * FROM devices WHERE user_id = ?';
    const [devices] = await connection.query(query, [userId]);
    return devices;
}

module.exports = { getAllDevices };
