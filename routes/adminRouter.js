const express = require('express')
const router = express.Router();
const adminController = require('../controllers/adminController/adminController')
const {verifyToken} = require('../middleware/adminAuth')


router.post('/login',adminController.login)
router.post('/update-user',verifyToken,adminController.updateProfile)
router.get('/users-details',verifyToken,adminController.userDetails)
router.get('/block-user',verifyToken,adminController.block)
router.get('/unblock-user',verifyToken,adminController.unblock)
router.get('/tutor-requests',verifyToken,adminController.tutorReq)
router.get('/approve-request',verifyToken,adminController.approveTutor)
router.get('/tutors-list',verifyToken,adminController.tutorslist)
router.get('/toggle-block',verifyToken,adminController.toggleBlockTutor)

module.exports = router