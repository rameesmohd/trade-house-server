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








module.exports = router