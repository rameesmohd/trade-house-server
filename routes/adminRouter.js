const express = require('express')
const router = express.Router();
const adminController = require('../controllers/adminController/adminController')


router.get('/users-details',adminController.userDetails)
router.post('/update-profile',adminController.updateProfile)



module.exports = router