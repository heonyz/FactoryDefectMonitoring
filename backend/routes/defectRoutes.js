const express = require('express');
const { getDefects, addDefect } = require('../controllers/defectController');
const router = express.Router();

router.get('/', getDefects); // 결함 목록 가져오기
router.post('/', addDefect); // 결함 추가

module.exports = router;
