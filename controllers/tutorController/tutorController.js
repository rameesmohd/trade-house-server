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
            }).status(200).json({token : token,id :tutor._id,profile :tutor})
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
        console.log('add-course');
        let banner = req.files?.banner ? req.files?.banner[0] : null
        let prevVideo = req.files?.preview ? req.files?.preview[0] : null
        let prevVideoURL;
        let bannerURL;
        const { title,
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
            preview :prevVideoURL,
            banner :bannerURL
        })
        newCourse.save().then((savedCourse)=>{
            res.status(200).json({message : 'course added succesfully!!'})
            console.log('course saved..');
        }).catch((error)=>{
            res.status(500).json({message : 'error saving course...'})
            console.log('error saving course...');
        })
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}

const myCourses=async(req,res)=>{
    try {
        console.log('fetched to my-courses');
        const courseData =  await courseModel.find({tutor : req.query.id})
        res.status(200).json({result : courseData})
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const editCourse=async(req,res)=>{
    try {
        console.log(req.files,'edditttttttttttt');
        console.log(req.body);
        let prevVideoURL;
        let bannerURL;
        let banner = req.files?.banner ? req.files?.banner[0] : null
        let prevVideo = req.files?.preview ? req.files?.preview[0] : null
        const { id,
                title,
                level,
                duration,
                category,
                description,
                skillsOffering,
                tutor } = req.body   
        console.log(banner,'ddddddddd',prevVideo);
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
        const update = await courseModel.updateOne({_id:id},{$set:{
                title: title,
                level: level,
                duration: duration,
                category: category,
                description: description,
                skillsOffering: skillsOffering,
                tutor: tutor,
                preview: prevVideo? prevVideoURL : req.body.preview,
                banner: banner? bannerURL : req.body.banner
        }})
        if(update){
            console.log('updated succesfully');
            res.status(200).json({message : 'Updated Successfully!!'})
        }else{
            res.status(500).json({message: 'Something went wrong!!server side error'})
        }
    } catch (error) {
        res.status(500)
        console.log(error.message);
    }
}

const tutorProfile=async(req,res)=>{
    try {
        console.log(req.query);
        const id= req.query.id
        const data = await userModel.findOne({_id:id,is_tutor : true})
        if(data){
            res.status(200).json({tutor:data})
        }else{
            res.status(400).json({message: 'user not found!!'})
        }
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}

const updateImage=async(req,res)=>{
    try {
        if(req.body.imgDataUrl && req.body.id){
           const Updated = await userModel.findByIdAndUpdate({_id :req.body.id},{$set :{image : req.body.imgDataUrl}})
           if(Updated){
            res.status(200).json({tutor:Updated})
           }
        }
    } catch (error) {
        res.status(500)
        console.log(error.message);
    }
}

module.exports= {
    initialVerify,
    addCourse,
    myCourses,
    editCourse,
    tutorProfile,
    updateImage
}