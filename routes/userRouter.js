const express = require('express')
const router = express.Router();
const userController = require('../controllers/userController/userController')
const paymentController = require('../controllers/paymentController/paymentController')
const multer = require('../config/multer');
const upload = multer.createMulter();
const {verifyToken} = require('../middleware/userAuth')

router.post('/signup',userController.register);
router.post('/login',userController.login);
router.post('/forgetpasswordauth',userController. forgetPasswordAuth);
router.post('/forgetpassword',userController. forgetPassword);
router.get('/all-courses',userController.allCourses)
router.post('/tutor-request',upload.single('file'),userController.submitRequest);
router.get('/payment',paymentController.paymentStatusHandle)

router.use(verifyToken)
router.get('/tutor-load',userController.tutorload);
router.post('/payment/:methord',paymentController.paymentModeHandle)

module.exports = router;
