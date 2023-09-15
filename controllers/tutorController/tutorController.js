const { generateTutorToken } = require('../../middleware/tutorAuth');
const userModel = require('../../model/userSchema')
const cloudinary = require('../../config/cloudinary')
const fs = require('fs')
const courseModel = require('../../model/courseSchema')
const categoryModel = require('../../model/categorySchema')
const moduleModel = require('../../model/moduleSchema')

const initialVerify =async(req,res)=>{
    try {
        const email = req.query.userEmail
        const tutor =  await userModel.findOne({email : email,is_tutor : true,is_blocked:false})
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
                tutor,price } = req.body    
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
            price:price,
            preview :prevVideoURL,
            banner :bannerURL
        })
        newCourse.save().then((savedCourse)=>{
            res.status(200).json({message : 'course added succesfully!!'})
            console.log('course saved..');
        }).catch((error)=>{
            res.status(500).json({message : 'error saving course...try again!!'})
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
        const courseData =  await courseModel.find({tutor : req.query.id}).populate('category')
        res.status(200).json({result : courseData})
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const editCourse=async(req,res)=>{
    try {
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
                tutor,price } = req.body   
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
                price:price,
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

const updateAbout=async(req,res)=>{
    try {
        console.log(req.body.tutorData);
        const {id,about_me} = req.body
        const Updated = await userModel.findByIdAndUpdate({_id :id},{$set :{about_me : about_me}})
        if(Updated){
         res.status(200).json({tutor:Updated})
        }
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}

const loadCategory=async(req,res)=>{
    try {
      const data = await categoryModel.find({})
      data ? res.status(200).json({result : data}) : res.status(500)
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const loadModules=async(req,res)=>{
    try {
        const modules = await moduleModel.find({courseId : req.query.courseId})
        modules ? res.status(200).json({result:modules}) : res.status(500)
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const saveModule=async(req,res)=>{
    try {
        const module = new moduleModel({
            title : req.body.title,
            courseId : req.body.courseId,
        }).save()
        module && res.status(200).json({message : 'Saved successfully'})
    } catch (error) {
        res.status(500)
        console.log(error.message);
    }
}

const deleteModule=async(req,res)=>{
    try {
        const id = req.query.id
        const success = await moduleModel.deleteOne({_id:id})
        success && res.status(200).json({message : 'Deleted successfully'}) 
    } catch (error) {
        console.log(error.message);
        res.status(500)
    }
}

const updateModule=async(req,res)=>{
    try {
        const id = req.body.id
        const newTitle = req.body.title
        const updated = await moduleModel.updateOne({_id : id},{$set:{title : newTitle}})
        updated && res.status(200).json({message : 'Updated succesfully'})
    } catch (error) {
        console.log(error.message);
        res.status(500)
    }
}

const addChapter=async(req,res)=>{
    try {
        console.log(req.body);
        const moduleId = req.body.moduleId
        const courseId = req.body.courseId
        const title = req.body.title
        const data =  await moduleModel.updateOne({_id:moduleId},{$push:{chapters :{chapter_title : title}}})
        const modules = await moduleModel.find({courseId : courseId})
        console.log(modules);
        data && res.status(200).json({result:modules,message: 'Chapter added successfully'}) 
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const updateChapter=async(req,res)=>{
    try {
        const moduleId = req.body.moduleId
        const chapterId = req.body.chapterId
        const title = req.body.title
        const currVideo = req.body.video
        const video = req.files.video ? req.files.video[0] : null
        let VideoURL;  
        console.log(currVideo);
        if(video){
            await cloudinary.uploader.upload(video.path,{ resource_type: "video",
            public_id: "video_upload_example"
            }).then((data) => {
                VideoURL = data.secure_url;
                fs.unlinkSync(video.path)
            }).catch((err) => {
                fs.unlinkSync(video.path)
                console.log(err)
            });
        }
        const update = await moduleModel.updateOne(
            { _id: moduleId, 'chapters._id': chapterId },
            { $set: { 'chapters.$':{
                chapter_title: title, 
                video: VideoURL ? VideoURL: currVideo, 
            }}})
        update && res.status(200)
        .json({message : 'Updated successfully',video : VideoURL ? VideoURL : currVideo ,chapter_title : title})
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const deleteChapter=async(req,res)=>{
    try {
        const chaptersId =req.query.chapter_id
        const moduleId = req.query.module_id
        const courseId = req.query.course_id
        const updateResult = await moduleModel.updateOne(
            { _id: moduleId },
            { $pull: { chapters: { _id: chaptersId } } }
          );
        
          if (updateResult.nModified === 1) {
            console.log('Chapter removed successfully.');
          } else {
            console.log('Chapter not found or not removed.');
          }
          const modules = await moduleModel.find({ courseId: courseId });
          res.status(200).json({result : modules})
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
    updateImage,
    updateAbout,
    loadCategory,
    saveModule,
    loadModules,
    deleteModule,
    updateModule,
    addChapter,
    updateChapter,
    deleteChapter
}