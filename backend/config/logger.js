const winston = require('winston');

function configureLogger() {
    return winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        transports: [
            new winston.transports.File({ filename: 'wal.log' }),
        ],
    });
}

module.exports = { configureLogger };
