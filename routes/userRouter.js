const express = require('express')
const router = express.Router();
const userController = require('../controllers/userController/userController')
const {googleVerify} = require('../middleware/auth')

router.post('/signup',userController.register)
router.post('/login',userController.login)
router.route('/forgetpassword')
        .get(userController.forgetPasswordAuth)
        .post(userController.forgetPassword)


module.exports = router