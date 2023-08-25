const express = require('express')
const router = express.Router();
const userController = require('../controllers/userController/userController')

router.post('/signup',userController.register)
router.post('/login',userController.login)
router.post('/forgetpasswordauth',userController.forgetPasswordAuth)
router.post('/forgetpassword',userController.forgetPassword)

module.exports = router