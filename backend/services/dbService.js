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

module.exports = { executeTransaction };
