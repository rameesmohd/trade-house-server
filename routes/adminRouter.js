const express = require('express')
const router = express.Router();
const adminController = require('../controllers/adminController/adminController')


router.get('/users-details',adminController.userDetails)
router.post('/update-user',adminController.updateProfile)
router.get('/block-user',adminController.block)
router.get('/unblock-user',adminController.unblock)




module.exports = router