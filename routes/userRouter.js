const express = require('express')
const router = express.Router();
const userController = require('../controllers/userController/userController')
const multer = require('../config/multer');
const upload = multer.createMulter();


router.post('/signup',userController.register);
router.post('/login',userController.login);
router.post('/forgetpasswordauth',userController. forgetPasswordAuth);
router.post('/forgetpassword',userController. forgetPassword);
router.post('/tutor-request',upload.single('file'),userController.submitRequest);

module.exports = router;
