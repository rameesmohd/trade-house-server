const { generateAdminToken } = require('../../middleware/adminAuth');
const userModel = require('../../model/userSchema');
const categoryModel = require('../../model/categorySchema')
const courseModel = require('../../model/courseSchema')

const login = async(req,res)=>{
    try {
        const {email,pass} = req.body
        const adminData = await userModel.findOne({
            $and: [
              { email: email },
              { password: pass },
              { is_admin: true }
            ]
          });
          if(!adminData)
           res.status(400).json({message : 'autherisation failed!!'}) 
          else {
              let token = generateAdminToken(adminData)
              res.cookie("jwt", {token,email}, {
                  httpOnly: false,
                  maxAge: 6000 * 1000
                }).status(200).json({token,email,message : 'login success'}) 
            }
    } catch (error) {
        console.log(error);
        res.status(500).json({message : 'server side error'})
    }
}

const userDetails = async(req,res)=>{
    try {
        const users = await userModel.find({
            $or: [
              { is_admin: false },
              { is_admin: { $exists: false } }
            ]
          });
        res.status(200).json({result : users})
    } catch (error) {
        res.json(500).json({result : error.message})
        console.log(error);
    }
}

const updateProfile = async(req,res)=>{
    try {
        const {id,name,email,mobile} = req.body
        const  data = await userModel.updateOne({ _id: id }, { $set: { name: name, mobile: mobile ,email : email} });
        data ? res.status(200).json({message : 'updated successfully'}) : '';
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message : '504 error'})        
    }
}

const handleUserBlock=async(req,res)=>{
    try {
        const {action,id}  = req.params
        console.log(action,id);
        if(action==='block'){
            await userModel.updateOne({ _id: id }, { $set: { is_blocked : true } });
            res.status(200).json({message : 'user blocked!!'})
        }
        else{
            await userModel.updateOne({ _id: id }, { $set: { is_blocked : false } });
            res.status(200).json({message : 'user unblocked!!'})
        }
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}


const tutorReq = async(req,res)=>{
    try {
        const requestedUsers = await userModel.find({is_requested : true})
        res.status(200).json({result : requestedUsers})
    } catch (error) {
        console.log(error.message1);
        res.status(500)
    }
}

const approveTutor =async(req,res)=>{
    try {
        const id = req.query.id
        const status =  await userModel.updateOne({_id : id},{$set:{is_tutor : true ,is_requested :false,req_status : 'approved'}})
        if(status){
            const requestedUsers =  await userModel.find({is_requested : true})
            res.status(200).json({result : requestedUsers})
        }
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const rejectTutorReq =async(req,res)=>{
    try {
        console.log('asdfdf');
        const id = req.query.id
        const status =  await userModel.updateOne({_id : id},{$set:{is_requested :false,req_status : 'rejected'}})
        if(status){
            const requestedUsers =  await userModel.find({is_requested : true})
            res.status(200).json({result : requestedUsers})
        }
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const tutorslist =async(req,res)=>{
    try {
        const tutorData =  await userModel.find({is_tutor : true})
        return tutorData ? res.status(200).json({result : tutorData}) : res.status(500)
    } catch (error) {
        console.log(error.message);
        return res.status(500)
    }
}

const toggleBlockTutor=async(req,res)=>{
    try {
        console.log(req.query);
        const success =  await userModel.updateOne({_id:req.query.id},{$set :{is_blocked : req.query.blockToggle}})
        if(success){
           const tutorData =  await userModel.find({is_tutor : true})
           return res.status(200).json({result : tutorData})
         }else{
            return res.status(500)
         }
    } catch (error) {
        console.log(error);
        return res.status(500)
    }
}

const addCategory=async(req,res)=>{
    try {
        console.log(req.body.newCategory);
        const catogary = new categoryModel({
            category : req.body.newCategory
        })
        catogary.save()
            .then(() => {
                res.status(200).json({message : 'saved successfully'})
            })
            .catch((error) => {
                res.status(500).json({message : error.message})
            });
    } catch (error) {
        res.status(500)
        console.log(err);
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

const updateCategory=async(req,res)=>{
    try {
        console.log(req.body);
        const update = await categoryModel.updateOne({_id:req.body.id},{$set:{category : req.body.newCategory}})
        update ? res.status(200).json({message : 'Updated Succeessfully!'}) : res.status(500)
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}

const allCourses=async(req,res)=>{
    try {
        console.log('ddddddd');
        const count = req.query.count
        const allCourses = await courseModel.find({}).skip(count).limit(4)
        .populate({
            path:'category',
            select : 'category'
        })
        .populate({
            path:'tutor',
            select : 'firstName lastName image'
        }) 
        res.status(200).json({result : allCourses})
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const toggleActiveCourse=async(req,res)=>{
    try {
        console.log(req.query);
        const success = await courseModel.updateOne({_id : req.query.id},{$set : {is_active : req.query.toggle}})
        success ? res.status(200) : res.status(500)
        console.log(success);
    } catch (error) {
        res.status(500)
        console.log(error.message);
    }
}


module.exports = {
    userDetails,
    updateProfile,
    login,
    tutorReq,
    approveTutor,
    tutorslist,
    toggleBlockTutor,
    addCategory,
    loadCategory,
    updateCategory,
    allCourses,
    toggleActiveCourse,
    rejectTutorReq,
    handleUserBlock
}