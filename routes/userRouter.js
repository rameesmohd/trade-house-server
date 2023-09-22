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
router.get('/payments',paymentController.paymentStatusHandle)

router.use(verifyToken)
router.post('/tutor-request',upload.single('file'),userController.submitRequest);
router.get('/tutor-load',userController.tutorload);
router.post('/payments/:methord',paymentController.paymentModeHandle)
router.post('/verifyRazorpay',paymentController.verifyrzpay)
router.get('/userpanel',userController.loadUserPanel)
router.patch('/image',userController.updateImage)
router.get('/loadmodule/:module_id',userController.loadModules)
router.patch('/module-completed',userController.moduleCompleted)
router.get('/purchased-courses',userController.loadPurchasedCourses)
router.patch('/cancel-purchase',userController.cancelPurchase)
router.patch('/update-progress',userController.updateLearningProgress)

module.exports = router;
