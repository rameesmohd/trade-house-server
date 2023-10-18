const { generateTutorToken } = require('../../middleware/tutorAuth');
const userModel = require('../../model/userSchema')
const cloudinary = require('../../config/cloudinary')
const fs = require('fs')
const bcrypt = require('bcrypt')
const courseModel = require('../../model/courseSchema')
const categoryModel = require('../../model/categorySchema')
const moduleModel = require('../../model/moduleSchema');
const { default: mongoose } = require('mongoose');
const orderModel = require('../../model/orderSchema');

const initialVerify =async(req,res)=>{
    try {
    const {email,password} = req.body
    const tutor =  await userModel.findOne({email : email,is_tutor : true,is_blocked:false})
    if(!tutor)
            return res.status(404).json({message : 'User not found!!'}) 
    else{
        if(password){
            const isMatch = await bcrypt.compare(password,tutor.password)
            if(isMatch){
                    console.log(isMatch);
                    const token = generateTutorToken(tutor._id)
                    res.cookie("jwt", {token : token}, {
                        httpOnly: false,
                        maxAge: 6000 * 1000
                    }).status(200).json({token : token,id :tutor._id})
            }else{
                return res.status(400).json({message : 'password incurrect!!'})
            }
        }else{
            return res.status(400).json({message : 'Unautherised access!!'})
        }
    }
    } catch (error) {
        console.log(error);
        return res.status(500)
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
        const image = req.files.image[0]
        if(image){
            const upload = await cloudinary.uploader.upload(image.path)
            let imageURL = upload.secure_url;
            fs.unlinkSync(image.path)
            const Updated = await userModel.findByIdAndUpdate({_id :req.body.id},{$set :{image : imageURL}})
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
        const newModule = new moduleModel({
            title: req.body.title,
            courseId: req.body.courseId,
          });
          
          newModule.save()
            .then((savedModule) => {
                console.log(savedModule);
              res.status(200).json({ message: 'Saved successfully', savedModule: savedModule });
            })
            .catch((error) => {
              console.error('Error:', error);
              res.status(500).json({ error: 'Internal Server Error' });
            });          
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
        const moduleId = req.body.moduleId
        const courseId = req.body.courseId
        const title = req.body.title
        const data =  await moduleModel.updateOne({_id:moduleId},{$push:{chapters :{chapter_title : title}}})
        const modules = await moduleModel.find({courseId : courseId})
        if(data){
            return res.status(200).json({result:modules,message: 'Chapter added successfully'}) 
        }
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
        if(video){
            await cloudinary.uploader.upload(video.path,{ resource_type: "video",
            public_id: "video_upload_example"
            }).then((data) => {
                VideoURL = data.secure_url;
                fs.unlinkSync(video.path)
            }).catch((err) => {
                fs.unlinkSync(video.path)
                return res.status(500).json({message : 'Network error'})
            });
        }
        const update = await moduleModel.updateOne(
            { _id: moduleId, 'chapters._id': chapterId },
            { $set: { 'chapters.$':{
                chapter_title: title, 
                video: VideoURL ? VideoURL: currVideo, 
            }}})
        if(update){
            return res.status(200).json({message : 'Updated successfully',video : VideoURL ? VideoURL : currVideo ,chapter_title : title})
        }
    } catch (error) {
        console.log(error);
        return res.status(500)
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
          return res.status(200).json({result : modules})
    } catch (error) {
        console.log(error.message);
        return res.status(500)
    }
}

const myStudentsLoad=async(req,res)=>{
    try {
        const tutor_id = new mongoose.Types.ObjectId(req.user._id);

        const myCourses = await courseModel.find({tutor:tutor_id},{_id:1})
        console.log(myCourses)

        const myCourse_ids = myCourses.map((course)=>course._id)

        const myCoursePurchases = await orderModel.find(
        {status:{$ne : 'refunded'}, course_id:{$in : myCourse_ids}},
        { date_of_purchase :1,learning_progress:1,status:1 
        }).populate({
            path: 'user_id',
            select : 'name email mobile image'
        }).populate({
            path : 'course_id',
            select : 'title'
        })
        return res.status(200).json({result : myCoursePurchases})
    } catch (error) {
        console.log(error);
        return res.status(500)
    }
}


const overViewLoad = async (req, res) => {
    try {
    const filter = req.query.filter
    let fromDate = req.query.from
    let toDate = req.query.to 
    const expand =req.query.expand === "true"

    const tutor_id = new mongoose.Types.ObjectId(req.user._id);

    const transaction = await userModel
    .findOne({ _id: tutor_id }, { b_wallet_balance: 1, b_wallet_transaction: 1 })
    .exec();
    const myCourses = await courseModel.find({ tutor: tutor_id }, { id: 1 })

    const calculateTotalAmount = async (startDate, endDate) => {
        const aggregationPipeline = [
          {
            $match: {
              status: 'success',
              is_refundable: false,
              date_of_purchase: {
                $gte: startDate,
                $lte: endDate
              },
              course_id: {
                $in: myCourses
            }
            }
          },
          {
            $group: {
              _id: null,
              totalAmount: {
                $sum: '$amount'
              }
            }
          }
        ];
        const totalAmount = await orderModel.aggregate(aggregationPipeline);
        if (totalAmount.length > 0) {
          return totalAmount[0].totalAmount;
        } else {
          return 0; // Return 0 if there are no orders
        }
    }    

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
      
    const firstDayOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const weeklyTotalRevenue = await calculateTotalAmount(lastWeek, today)*0.75
    const monthlyTotalRevenue = await calculateTotalAmount(firstDayOfThisMonth, today)*0.75
    const totalRevenue = await calculateTotalAmount(new Date(0), today)*0.75

    const thisYear = new Date().getFullYear();
    const monthlySalesAmountsArray = [];
    
    for (let month = 0; month < 12; month++) {
      const startDate = new Date(thisYear, month, 1);
      const endDate = new Date(thisYear, month + 1, 0);
    
      const monthlySales = await calculateTotalAmount(startDate, endDate) * 0.75;
    
      monthlySalesAmountsArray.push(monthlySales);
    }
    
    console.log(monthlySalesAmountsArray); 
    
        
      
      let recentSales;
    if(fromDate && toDate){
        recentSales = await orderModel
          .find({
            course_id: { $in: myCourses },
            date_of_purchase: { $gte: fromDate, $lte: toDate },
          })
          .sort({ date_of_purchase: -1 })
          .populate({
            path : 'course_id',
            select : 'title',
            populate: {
                path: 'tutor', 
                select: 'firstName lastName '
            }
        }).populate({
            path:'user_id',
            select : 'name email'
        }).exec();
    }else{
    if(expand){
        if (filter === 'Daily') {
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            const tomorrow = new Date();
            tomorrow.setHours(23, 59, 59, 999); 
            recentSales = await orderModel
              .find({
                course_id: { $in: myCourses },
                date_of_purchase: { $gte: today, $lte: tomorrow },
              })
              .sort({ date_of_purchase: -1 })
              .populate({
                path: 'user_id',
                select: 'name email',
              })
              .populate({
                path: 'course_id',
                select: 'title',
              })
              .exec();
          } else if (filter === 'Weekly') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
          
            recentSales = await orderModel
              .find({
                course_id: { $in: myCourses },
                date_of_purchase: { $gte: lastWeek },
              })
              .sort({ date_of_purchase: -1 })
              .populate({
                path: 'user_id',
                select: 'name email',
              })
              .populate({
                path: 'course_id',
                select: 'title',
              })
              .exec();
          } else if (filter === 'Yearly') {
            const lastYear = new Date();
            lastYear.setFullYear(lastYear.getFullYear() - 1);
            recentSales = await orderModel
              .find({
                course_id: { $in: myCourses },
                date_of_purchase: { $gte: lastYear },
              })
              .sort({ date_of_purchase: -1 })
              .populate({
                path: 'user_id',
                select: 'name email',
              })
              .populate({
                path: 'course_id',
                select: 'title',
              })
              .exec();
          } else {
            recentSales = await orderModel
              .find({ course_id: { $in: myCourses } })
              .sort({ date_of_purchase: -1 })
              .populate({
                path: 'user_id',
                select: 'name email',
              })
              .populate({
                path: 'course_id',
                select: 'title',
              })
              .exec();
          }
        }else{
            recentSales = await orderModel
            .find({ course_id: { $in: myCourses } })
            .sort({ date_of_purchase: -1 })
            .limit(5)
            .populate({
                path : 'user_id',
                select : 'name email'
            })
            .populate({
                path : 'course_id',
                select : 'title'
            })
            .exec();

       
        }}     
    return res.status(200)
    .json({ transaction: transaction,
            recentSales: recentSales,
            weeklyTotalRevenue: weeklyTotalRevenue,
            monthlyTotalRevenue: monthlyTotalRevenue,
            totalRevenue:totalRevenue,
            monthlySalesAmountsArray:monthlySalesAmountsArray });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const disableCourse=async(req,res)=>{
    try {
        const { courseId } =  req.query
        await courseModel.updateOne({_id:courseId},{$set : {is_active : false}})
        res.status(200).json({message:'course deleted sucessfully'})
    } catch (error) {
        console.log(error);
        res.status(500).json({error: 'Internal Server Error' })
    }
  }



module.exports= {
    initialVerify,
    addCourse,
    myCourses,
    editCourse,
    disableCourse,
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
    deleteChapter,
    myStudentsLoad,
    overViewLoad,
}