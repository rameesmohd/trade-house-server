const express = require('express')
const router = express.Router()
const tutorController = require('../controllers/tutorController/tutorController')
const {verifyToken} = require('../middleware/tutorAuth')
const multer = require('../config/multer')
const upload = multer.createMulter()

router.post('/login',tutorController.initialVerify)


router.use(verifyToken)

router.route('/courses')
    .post(upload.fields([{ name: 'banner' }, { name: 'preview' }]),tutorController.addCourse)
    .patch(upload.fields([{ name: 'banner' }, { name: 'preview' }]),tutorController.editCourse)
    .get(tutorController.myCourses)

router.route('/modules')
    .get(tutorController.loadModules)
    .post(tutorController.saveModule)
    .patch(tutorController.updateModule)
    .delete(tutorController.deleteModule)
    
router.route('/chapter')
    .post(tutorController.addChapter)
    .patch(upload.fields([{name:'video'}]),tutorController.updateChapter)
    .delete(tutorController.deleteChapter)
    
router.get('/profile',tutorController.tutorProfile)
router.get('/category',tutorController.loadCategory)
router.patch('/about',tutorController.updateAbout)
router.patch('/image',tutorController.updateImage)
    

module.exports = router