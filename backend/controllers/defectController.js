const { executeTransaction } = require('../services/dbService');
const client = require('../services/redisClient');

/**
 * 결함 목록 조회 (Redis 캐싱 적용)
 */
async function getDefects(req, res) {
    try {
        const cacheKey = 'defects:all';
        const cachedDefects = await client.get(cacheKey);

        if (cachedDefects) {
            return res.status(200).json(JSON.parse(cachedDefects));
        }

        await executeTransaction(async (connection) => {
            const query = 'SELECT * FROM defects';
            const [defects] = await connection.query(query);

            if (defects.length) {
                await client.setEx(cacheKey, 3600, JSON.stringify(defects)); // 1시간 캐싱
            }

            res.status(200).json(defects);
        });
    } catch (error) {
        res.status(500).send('Error fetching defects');
    }
}

/**
 * 결함 추가 (DB 삽입 후 Redis 캐시 삭제)
 */
async function addDefect(req, res) {
    const { device_id, image_path } = req.body;

    try {
        await executeTransaction(async (connection) => {
            const query = 'INSERT INTO defects (device_id, image_path) VALUES (?, ?)';
            await connection.query(query, [device_id, image_path]);
        });

        // 새 결함 추가 시 Redis 캐시 삭제
        await client.del('defects:all');

        res.status(201).send('Defect added successfully');
    } catch (error) {
        res.status(500).send('Error adding defect');
    }
}

module.exports = { getDefects, addDefect };
