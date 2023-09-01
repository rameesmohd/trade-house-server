const express = require('express')
const router = express.Router()
const tutorController = require('../controllers/tutorController/tutorController')
const {verifyToken} = require('../middleware/tutorAuth')

router.post('/t-verify',tutorController.initialVerify)









module.exports = router