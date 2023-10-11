const express = require('express')
const router = express.Router();
const userController = require('../controllers/userController/userController')
const paymentController = require('../controllers/paymentController/paymentController')
const chatController = require('../controllers/chatController/chatController')
const multer = require('../config/multer');
const upload = multer.createMulter();
const {verifyToken} = require('../middleware/userAuth')

router.post('/signup',userController.register);
router.post('/login',userController.login);
router.post('/forgetpasswordauth',userController. forgetPasswordAuth);
router.post('/forgetpassword',userController. forgetPassword);
router.get('/payments',paymentController.paymentStatusHandle)
router.get('/categories',userController.categoryLoad)
router.get('/courses',userController.allCourses)
router.post('/contact',userController.contactUs)
router.get('/load-course',userController.loadCourse)

router.use(verifyToken)
router.post('/tutor-request',upload.single('file'),userController.submitRequest);
router.get('/tutor-load',userController.tutorload);
router.post('/payments/:methord',paymentController.paymentModeHandle)
router.post('/verifyRazorpay',paymentController.verifyrzpay)
router.get('/userpanel',userController.loadUserPanel)
router.patch('/image',upload.fields([{name:'image'}]),userController.updateImage)
router.get('/loadmodule/:module_id',userController.loadModules)
router.patch('/module-completed',userController.moduleCompleted)
router.patch('/cancel-purchase',userController.cancelPurchase)
router.patch('/update-progress',userController.updateLearningProgress)

router.route('/chat')
    .get(chatController.fetchChats)
    .post(chatController.accessChat)
    
router.route('/message')
    .get(chatController.allMessages)
    .post(chatController.sendMessage)

router.route('/review')
    .post(userController.addReview)
    
module.exports = router;
