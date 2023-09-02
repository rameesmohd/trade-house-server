const { generateTutorToken } = require('../../middleware/tutorAuth');
const userModel = require('../../model/userSchema')
const cloudinary = require('../../config/cloudinary')
const fs = require('fs')
const courseModel = require('../../model/courseSchema')

const initialVerify =async(req,res)=>{
    try {
        const email = req.body.userEmail
        const tutor =  await userModel.findOne({email : email,is_tutor : true})
        if(tutor){
            const token = generateTutorToken(tutor._id)
            res.cookie("jwt", {token : token}, {
                httpOnly: false,
                maxAge: 6000 * 1000
            }).status(200).json({token : token,id :tutor._id})
        }else{
            res.status(400).json({message : 'Unautherised access!!'})
        }
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const addCourse=async(req,res)=>{
    try {
        const prevVideo = req.files?.preview[0]
        const banner = req.files?.banner[0]
        let prevVideoURL;
        let bannerURL;
        const {
            title,
            level,
            duration,
            category,
            description,
            skillsOffering,
            tutor } = req.body    
        if(prevVideo){
            await cloudinary.uploader.upload(prevVideo.path,{ resource_type: "video",
            public_id: "video_upload_example"
            }).then((data) => {
                prevVideoURL = data.secure_url;
                fs.unlinkSync(prevVideo.path)
            }).catch((err) => {
                fs.unlinkSync(prevVideo.path)
                console.log(err)
            });
        }
        if(banner){
            const upload = await cloudinary.uploader.upload(banner.path)
            bannerURL = upload.secure_url;
            fs.unlinkSync(banner.path)
        }
        
        const newCourse = new courseModel({
            title :title,
            level :level,
            duration :duration,
            category :category,
            description :description,
            skillsOffering :skillsOffering,
            tutor :tutor,
            preview:prevVideoURL,
            banner:bannerURL
        })
        newCourse.save().then((savedCourse)=>{
            res.status(200).json({message : 'course added succesfully!!'})
            console.log('course saved..',savedCourse);
        }).catch((error)=>{
            res.status(500).json({message : 'error saving course...'})
            console.log('error saving course...',error);
        })
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}

const myCourses=async(req,res)=>{
    try {
        console.log(req.query);
        console.log('fetched to mycourses');
        const courseData =  await courseModel.find({tutor : req.query.id})
        res.status(200).json({result : courseData})
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

module.exports= {
    initialVerify,
    addCourse,
    myCourses
}