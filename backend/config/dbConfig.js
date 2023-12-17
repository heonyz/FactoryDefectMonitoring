const mysql = require('mysql2/promise');

function configureDatabase(logger) {
    const pool = mysql.createPool({
        host: 'mysql',
        user: 'root',
        password: 'password',
        database: 'surface_inspection',
        waitForConnections: true,
        connectionLimit: 20,
        queueLimit: 0,
    });

    pool.on('error', (err) => {
        logger.error('Database error:', err);
    });

    return pool;
}

module.exports = { configureDatabase };
