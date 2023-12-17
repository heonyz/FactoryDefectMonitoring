const { executeTransaction } = require('../services/dbService');

async function getDefects(req, res) {
    try {
        // 결함 목록 조회 로직
    } catch (error) {
        res.status(500).send('Error fetching defects');
    }
}

async function addDefect(req, res) {
    const { device_id, image_path } = req.body;

    try {
        await executeTransaction(async (connection) => {
            const query = 'INSERT INTO defects (device_id, image_path) VALUES (?, ?)';
            await connection.query(query, [device_id, image_path]);
        });
        res.status(201).send('Defect added successfully');
    } catch (error) {
        res.status(500).send('Error adding defect');
    }
}

module.exports = { getDefects, addDefect };
