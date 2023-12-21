const { executeTransaction } = require('../services/dbService');
const client = require('../services/redisClient');

/**
 * 사용자 기기 목록 가져오기 (Redis 캐싱 적용)
 */
async function getDevices(req, res) {
    const userId = req.session.userId;

    try {
        const cacheKey = `devices:${userId}`;
        const cachedDevices = await client.get(cacheKey);

        if (cachedDevices) {
            return res.status(200).json(JSON.parse(cachedDevices));
        }

        await executeTransaction(async (connection) => {
            const query = 'SELECT * FROM devices WHERE user_id = ?';
            const [devices] = await connection.query(query, [userId]);

            if (devices.length) {
                await client.setEx(cacheKey, 1800, JSON.stringify(devices)); // 30분 캐싱
            }

            res.status(200).json(devices);
        });
    } catch (error) {
        res.status(500).send('Error fetching devices');
    }
}

/**
 * 기기 등록 (DB 삽입 후 Redis 캐시 삭제)
 */
async function registerDevice(req, res) {
    const { devicename, devicetype } = req.body;
    const userId = req.session.userId;

    try {
        await executeTransaction(async (connection) => {
            const query = 'INSERT INTO devices (user_id, devicename, devicetype) VALUES (?, ?, ?)';
            await connection.query(query, [userId, devicename, devicetype]);
        });

        // 새 장치 추가 시 Redis 캐시 삭제
        await client.del(`devices:${userId}`);

        res.status(201).send('Device registered successfully');
    } catch (error) {
        res.status(500).send('Error registering device');
    }
}

/**
 * 특정 기기 상세 정보 가져오기 (Redis 캐싱 적용)
 */
async function getDeviceDetails(req, res) {
    const deviceId = req.params.id;

    try {
        const cacheKey = `device:${deviceId}`;
        const cachedDevice = await client.get(cacheKey);

        if (cachedDevice) {
            return res.status(200).json(JSON.parse(cachedDevice));
        }

        await executeTransaction(async (connection) => {
            const query = 'SELECT * FROM devices WHERE id = ?';
            const [device] = await connection.query(query, [deviceId]);

            if (device.length) {
                await client.setEx(cacheKey, 3600, JSON.stringify(device[0])); // 1시간 캐싱
            }

            res.status(200).json(device[0] || {});
        });
    } catch (error) {
        res.status(500).send('Error fetching device details');
    }
}

module.exports = { getDevices, registerDevice, getDeviceDetails };
