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



module.exports = router