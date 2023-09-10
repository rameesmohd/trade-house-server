const express = require('express')
const router = express.Router()
const tutorController = require('../controllers/tutorController/tutorController')
const {verifyToken} = require('../middleware/tutorAuth')
const multer = require('../config/multer')
const upload = multer.createMulter()

router.post('/t-verify',tutorController.initialVerify)
router.post('/add-course',verifyToken,upload.fields([{ name: 'banner' }, { name: 'preview' }]),tutorController.addCourse)
router.post('/edit-course',verifyToken,upload.fields([{ name: 'banner' }, { name: 'preview' }]),tutorController.editCourse)
router.get('/my-courses',verifyToken,tutorController.myCourses)
router.get('/tutor-profile',verifyToken,tutorController.tutorProfile)
router.post('/update-image',verifyToken,tutorController.updateImage)
router.post('/update-about',verifyToken,tutorController.updateAbout)
router.get('/category',verifyToken,tutorController.loadCategory)
router.get('/load-modules',verifyToken,tutorController.loadModules)
router.post('/save-module',verifyToken,tutorController.saveModule)
router.post('/update-module',verifyToken,tutorController.updateModule)
router.get('/remove-module',verifyToken,tutorController.deleteModule)
router.post('/add-chapter',verifyToken,tutorController.addChapter)



module.exports = router