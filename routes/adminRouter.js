const express = require('express')
const router = express.Router();
const adminController = require('../controllers/adminController/adminController')
const {verifyToken} = require('../middleware/adminAuth')


router.post('/login',adminController.login)

router.use(verifyToken);

router.route('/users')
    .get(adminController.userDetails)
    .patch(adminController.updateProfile)
    
router.route('/category')
    .get(adminController.loadCategory)
    .post(adminController.addCategory)
    .patch(adminController.updateCategory);
    
router.patch('/:action/:id', adminController.handleUserBlock);
router.get('/tutor-requests',adminController.tutorReq)
router.patch('/approve-request',adminController.approveTutor)
router.patch('/reject-request',adminController.rejectTutorReq)
router.get('/tutors-list',adminController.tutorslist)
router.patch('/toggle-block',adminController.toggleBlockTutor)
router.get('/all-courses',adminController.allCourses)
router.patch('/toggle-activecourse',adminController.toggleActiveCourse)


module.exports = router