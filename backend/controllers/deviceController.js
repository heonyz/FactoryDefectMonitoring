const { executeTransaction } = require('../services/dbService');

async function getDevices(req, res) {
    const userId = req.session.userId;
    try {
        // 사용자 기기 목록 가져오기
    } catch (error) {
        res.status(500).send('Error fetching devices');
    }
}

async function registerDevice(req, res) {
    const { devicename, devicetype } = req.body;
    const userId = req.session.userId;

    try {
        await executeTransaction(async (connection) => {
            const query = 'INSERT INTO devices (user_id, devicename, devicetype) VALUES (?, ?, ?)';
            await connection.query(query, [userId, devicename, devicetype]);
        });
        res.status(201).send('Device registered successfully');
    } catch (error) {
        res.status(500).send('Error registering device');
    }
}

async function getDeviceDetails(req, res) {
    const deviceId = req.params.id;

    try {
        // 특정 기기 상세 정보 가져오기
    } catch (error) {
        res.status(500).send('Error fetching device details');
    }
}

module.exports = { getDevices, registerDevice, getDeviceDetails };
