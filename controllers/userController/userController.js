const bcrypt = require('bcrypt')
const {generateAuthToken} = require('../../middleware/userAuth');
const usermodel = require('../../model/userSchema');
const nodeMailer = require('nodemailer')
const fs = require('fs')
const cloudinary = require('../../config/cloudinary');
const courseModel = require('../../model/courseSchema');
const orderModel = require('../../model/orderSchema');
const moduleModel = require('../../model/moduleSchema')
const contactModel = require('../../model/contactSchema')
const categoryModel = require('../../model/categorySchema')
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');
let errMsg,msg;

const register = async(req,res)=>{
    try {

        console.log('object')
        let {name,email,mobile,password} = req.body
        const user = await usermodel.findOne({email: email});
        if(!user){
            const hashpassword = await bcrypt.hash(password,10)
            await usermodel.create({
                name: name,
                email: email.toLowerCase(),
                mobile: mobile,
                password: hashpassword
            })
            return res.status(200).json({ msg:'Registered successfully' })
        }else{
           return res.status(400).json({errMsg: 'Email already exists'})
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({errMsg: 'Server error'})
    }
}

const login = async (req, res) => {
    try {
        let response = {
            user_id : null,
            message: null,
            token: null,
            name: null,
            email : null,
            status : null,
            is_requested : null,
            is_tutor : null
        },email,isMatch
        req.body.google ? email = req.body.payload.email : email = req.body.email
        const userDetails = await usermodel.findOne({ email: email })
        if (userDetails) {
            if(userDetails.is_blocked){ 
                response.message = 'account suspended!!'
                return res.status(400).json({ response }) }
                else{
                    if(req.body?.password){
                        isMatch = await bcrypt.compare(req.body.password,userDetails.password) 
                    }
                    if (isMatch || req.body.google) {
                        response.token = generateAuthToken(userDetails);
                        response.message = 'You have logged in';
                        response.name = userDetails.name;
                        response.user_id = userDetails._id
                        response.status = true
                        response.email = userDetails.email
                        response.is_requested = userDetails.is_requested
                        response.is_tutor = userDetails.is_tutor
                        let token = response.token;
                        let name = response.name;
                        const obj = { token, name }
                return res.cookie("jwt", obj, {
                    httpOnly: false,
                    maxAge: 6000 * 1000
                }).status(200).json({ response });
            } else {
                response.message = 'Password is wrong!!';
                return res.status(400).json({ response });
            }
        }
        } else{
            response.message = 'User does not exist!!';
            return res.status(400).json({ response });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const forgetPasswordAuth= async(req,res)=>{
    try {
        const user = await usermodel.findOne({email : req.body.email});
        if(user){
            const bool =  sendResetPasswordMail(user.name,user.email,req.body.OTP)
            bool ? res.status(200)
                .json({ message:'OTP sent successfully,please check your email' })
            : res.status(500).json({message:'Error sending email'});
        }else 
            res.status(400).json({message: 'user not exists,please signup'})
    } catch (error) {
        res.status(500).json({message: 'Server side error'})
    }
}

const sendResetPasswordMail = async(name,email,OTP)=>{
    try {
        const transporter = nodeMailer.createTransport({
            host:'smtp.gmail.com',
            port:465,
            secure:true,
            require:true,
            auth:{
                user:'tradehouseacademy@gmail.com',
                pass : 'tanemecfugsijseq'
            }
        })
        const mailOptions = {
            from : 'tradehouseacademy@gmail.com',
            to:email,
            subject:'For Verification mail',
            html:'<p>Hii '+name+',reset password OTP :'+OTP+'</p>'
        }
        transporter.sendMail(mailOptions, function(error,info){
            if(error){
                console.log(error);
                return false
                // res.status(500).json({message:'Error sending email'});
            }else{
                console.log("Email has been sent :- ",info.response);
                return true
                // res.status(200).json({ message:'OTP sent successfully,please check your email' })
            }
        }) 
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPassword=async(req,res)=>{
    try {   
        const hashpassword = await bcrypt.hash(req.body.password,10)
        const email = req.body.email
        const reset = await usermodel.updateOne({email: email},{$set:{password : hashpassword}})
        reset ? res.status(200).json({message:'password changed succesfully'}) :
        res.status(400).json({message :'client side error'})
    } catch (error) {
        res.status(500).json({message:'server side error'})
    }
}

const submitRequest= async(req,res)=>{
    try{
        const  {category,experience,qualification,type,firstName,email,lastName} = req.body
        const file = req.file
        let pdf

        const upload = await cloudinary.uploader.upload(file?.path)
            pdf = upload.secure_url;
            fs.unlinkSync(file.path)
        
        const update = await usermodel.updateOne({email : email},{$set : {
            is_requested : true,
            category : category,
            experience : experience,
            qualification : qualification,
            type_of_trader :type,
            CV:pdf,
            firstName :firstName,
            lastName : lastName
    }})
    if(update){
        res.status(200).json({message : 'Request submitted successfully!'})
    }
    } catch (error) {
        res.status(500).json({message : error.message})
        if (req.file) fs.unlinkSync(file.path)
        console.log(error);   
    }
}

const allCourses=async(req,res)=>{
    try {
        console.log(req.query)
        const { category, level, price ,search , skip ,limit} = req.query;
        const [variable1, variable2] = price.split(',').map(Number);
        
        const searchQuery = {
            $or: [
            { title: { $regex: new RegExp(search, 'i') } }, 
            { 'tutor.firstName': { $regex: new RegExp(search, 'i') } }, 
            { 'tutor.lastName': { $regex: new RegExp(search, 'i') } }
            ]
        }
            
        const findQuery = {
          is_active: true,
          ...(category !== 'All' && { category }),
          ...(level !== 'All' && { level }),
          ...(price !== 'All' && { price: { $gte: variable1, $lt: variable2 }}),
          ...(search !== 'All' && (isNaN(Number(search)) ? searchQuery : { price: Number(search) })),
        };
          
        let courses = await courseModel
          .find(findQuery,{banner:1,title:1,tutor:1,price:1, total_rating:1}).skip(skip).limit(limit)
          .populate({path : 'tutor', select : 'firstName lastName'})
          .populate('category');

        return courses
          ? res.status(200).json({ result: courses })
          : res.status(500).json({ error: 'Courses not found' });
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Internal server error' });
      }      
}

const tutorload=async(req,res)=>{
    try {
        const email = req.query.email
        const userData =  await usermodel.findOne({email: email})
        return res.status(200).json({result : userData})
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const loadUserPanel=async(req,res)=>{
    try {
       const userId = new mongoose.Types.ObjectId(req.user._id)
       const userData = await usermodel.findOne({_id:userId},{email:1,image:1,mobile:1,name:1,wallet:1})
       const purchaseData = await orderModel.find({user_id : userId})
       .populate({
        path: 'course_id',
        select: 'title'})
       const course_ids =  purchaseData.map((obj)=>obj.status==='success'? obj.course_id : null)
       const modules = await moduleModel.find({courseId : {$in : course_ids}},{chapters : 0})
       if(userData && purchaseData){
           return res.status(200).json({purchaseData: purchaseData, userData: userData, moduleData:modules})
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
            const Updated = await usermodel.findByIdAndUpdate({_id :req.body.id},{$set :{image : imageURL}})
            if(Updated){
            res.status(200).json({tutor:Updated})
            }
        }
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}

const loadModules=async(req,res)=>{
    const {module_id} = req.params 
    try {
        const moduleData = await moduleModel.findById(module_id)
        if(!moduleData){
            return res.status(404).json({message : 'module not found'})
        }else{
            return res.status(200).json({moduleData : moduleData})
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message : 'sever error'})
    }   
}

const moduleCompleted=async(req,res)=>{
    try {
        const userId = new mongoose.Types.ObjectId(req.user._id)
        const moduleId = req.body.module_id
        const module_index = req.body.module_index
        const module = await moduleModel.findByIdAndUpdate({_id:moduleId},{$addToSet :{completed_users : userId}})
        if(module_index===0){
            const updatedOrder = await orderModel.findOneAndUpdate(
                { course_id: module.courseId, user_id: userId },
                { $set: { is_refundable: false } },
                { new: true }
              ).populate({
                    path:'course_id',
                    select:'tutor '
                }).exec();
              
            const tutorPerc = Math.floor(updatedOrder.amount * 0.75);
            const adminPerc = Math.floor(updatedOrder.amount * 0.25);
              
            const t_update =  await usermodel.updateOne(
                { _id: updatedOrder.course_id.tutor },
                {
                  $inc: { b_wallet_balance: tutorPerc },
                  $push: {
                    b_wallet_transaction: {
                      order_id : updatedOrder._id,  
                      amount: tutorPerc,
                      transaction_type: 'credit',
                      date : new Date()
                    }
                  }
                }
              );
              
            const a_update = await usermodel.updateOne(
                { email: 'admin@gmail.com' },
                {
                  $inc: { b_wallet_balance: adminPerc },
                  $push: {
                    b_wallet_transaction: {
                      order_id : updatedOrder._id,  
                      amount: adminPerc,
                      transaction_type: 'credit',
                      date : new Date()
                    }
                  }
                }
            )   
            console.log(t_update,a_update);
        }
        return module ? res.status(200).json({message : 'Next module unlocked!!'}) : res.status(500)
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}

const loadCourse=async(req,res)=>{
     try {
        console.log('requested course course with query');
        const user =  req?.user?._id
        let purchasedCourses = []
        if(user){
            const user = new mongoose.Types.ObjectId(req.user._id);
            const purchased = await orderModel.aggregate([
                {
                $match:{
                    user_id : user._id,
                    status : 'success'
                }
            },
            {
                $project:{
                    course_id : 1,
                    _id:0
                }
            }
        ])
            purchased.length ? purchasedCourses = purchased.map((obj)=>obj.course_id) : null 
        }

        let coursesDetails = await courseModel
        .findOne({_id : req.query.courseId},{banner : 0,category:0 ,price : 0,title : 0})
        .populate('tutor','firstName lastName image experience type_of_trader about_me')

        console.log('returned')
        return coursesDetails ?
        res.status(200).json({ courseExpand: coursesDetails ,result : purchasedCourses}) :
        res.status(500).json({ error: 'Courses not found' });
     } catch (error) {
        console.log(error);
        res.status(500)
     }
}

const cancelPurchase = async (req, res) => {
    try {
      const order_id = req.body.order_id;
      const feedback = req.body.feedback;
      const updatedData = await orderModel.findByIdAndUpdate(order_id,{ $set: {is_refundable: false,user_message: feedback,status:'refunded'}});
      if (updatedData) {
        const user_id = new mongoose.Types.ObjectId(req.user._id);
        const wallet = req.body.wallet;
  
        const update = await usermodel.updateOne(
          { _id: user_id },
          { $set: { wallet: wallet + updatedData.amount } }
        );

        if (update ) {
          return res.status(200).json({ message: 'Amount refunded to wallet'});
        } else {
          return res.status(500).json({ message: 'Failed to update wallet' });
        }
      } else {
        return res.status(404).json({ message: 'Order not found' });
      }
    } catch (error) {
      console.error(error.message);
      return res.status(500).json({ message: 'Server error' });
    }
  };

const updateLearningProgress=async(req,res)=>{
    try {
        console.log(req.body);
        const progress = await orderModel.updateOne({_id:req.body.order_id},{$set:{learning_progress : req.body.progress}})
        if(progress){
            return res.status(200)
        }
    } catch (error) {
        console.log(error);
        return res.status(500)
    }
}

const categoryLoad=async(req,res)=>{
    try {
        console.log('category fetching..........');
        const response = await categoryModel.find({}).exec()
        res.status(200).json({result : response})
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const contactUs=async(req,res)=>{
    try {
        const {email,subject,comment} = req.body.data
        await contactModel.create({ email, subject, comment ,date : new Date()})
        res.status(200).json({message : 'Added successfully'})
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}
  
const addReview=async(req,res)=>{
    try {
        const {rating,feedback ,id} = req.body
        const userId = new mongoose.Types.ObjectId(req.user._id)
        const user =  await usermodel.findOne({_id:userId})
        const review ={
            user_id : userId,
            user_name: user.name,
            rating  : rating,
            review : feedback,
            date : new Date()
        }
        const updatedData = await courseModel
        .findOneAndUpdate(
          { _id: id },
          { $push: { user_ratings: review } },
          { new: true } 
        )
        .populate('tutor', 'firstName lastName image experience type_of_trader about_me')
        .populate('category')
        .exec();

        return res.status(200).json({courseData : updatedData})
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}


module.exports = {
    register,
    login,
    forgetPasswordAuth,
    forgetPassword,
    submitRequest,
    allCourses,
    tutorload,
    loadUserPanel,
    updateImage,
    loadModules,
    moduleCompleted,
    loadCourse,
    cancelPurchase,
    updateLearningProgress,
    categoryLoad,
    contactUs,
    addReview
}