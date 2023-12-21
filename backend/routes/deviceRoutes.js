const express = require('express');
const { getDevices, registerDevice, getDeviceDetails } = require('../controllers/deviceController');
const router = express.Router();

router.get('/', getDevices); // 기기 목록 가져오기
router.post('/register', registerDevice); // 기기 등록
router.get('/:id', getDeviceDetails); // 특정 기기 정보 가져오기

module.exports = router;
