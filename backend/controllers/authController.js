const bcrypt = require('bcrypt');
const { executeTransaction } = require('../services/dbService');
const client = require('../services/redisClient');
const { getUserByUsername } = require('../services/userService');

async function login(req, res) {
    const { username, password } = req.body;

    try {
        // Redis에서 사용자 정보 조회
        let user = await client.get(`user:${username}`);

        if (!user) {
            // DB에서 조회
            await executeTransaction(async (connection) => {
                user = await getUserByUsername(connection, username);
            });

            if (!user) {
                return res.status(401).send('Invalid username or password');
            }

            // Redis에 캐싱 (1시간 TTL)
            await client.setEx(`user:${username}`, 3600, JSON.stringify(user));
        } else {
            user = JSON.parse(user);
        }

        // 비밀번호 검증
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).send('Invalid username or password');
        }

        res.status(200).send('Login successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Login error');
    }
}

async function signup(req, res) {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        await executeTransaction(async (connection) => {
            await addUser(connection, { ...req.body, password: hashedPassword });
        });

        // 회원가입 성공 시 Redis에서 해당 캐시 삭제
        await client.del(`user:${username}`);

        res.status(201).send('Signup successful');
    } catch (error) {
        console.error(error);
        res.status(500).send('Signup error');
    }
}

module.exports = { login, signup };
