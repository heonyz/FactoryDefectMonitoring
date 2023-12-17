const bcrypt = require('bcrypt');
const { executeTransaction } = require('../services/dbService');

async function login(req, res) {
    const { username, password } = req.body;
    try {
        // 로그인 로직
    } catch (error) {
        res.status(500).send('Login error');
    }
}

async function signup(req, res) {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        // 사용자 등록 로직
    } catch (error) {
        res.status(500).send('Signup error');
    }
}

module.exports = { login, signup };
