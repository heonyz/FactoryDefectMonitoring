// Defect 관련 DB 로직
async function getAllDefects(connection) {
    const query = 'SELECT * FROM defects';
    const [defects] = await connection.query(query);
    return defects;
}

module.exports = { getAllDefects };
