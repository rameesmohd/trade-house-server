const { generateAdminToken } = require('../../middleware/auth');
const userModel = require('../../model/userSchema')

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
              res.cookie("jwt", token, {
                  httpOnly: false,
                  maxAge: 6000 * 1000
                }).status(200).json({message : 'login success'}) 
            }
    } catch (error) {
        console.log(error);
        res.status(500).json({message : 'server side error'})
    }
}


const userDetails = async(req,res)=>{
    try {
        const users = await userModel.find({})
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

const block=async(req,res)=>{
    try {
        const id = req.query.id
        await userModel.updateOne({ _id: id }, { $set: { is_blocked : true } });
        res.status(200).json({message : 'user blocked!!'})
    } catch (error) {
        console.log(error.message);
        res.status(500)
    }
}

const unblock=async(req,res)=>{
    try {
        const id = req.query.id
        await userModel.updateOne({ _id: id }, { $set: { is_blocked : false } });
        res.status(200).json({message : 'user unblocked!!'})
    } catch (error) {
        console.log(error.message);
        res.status(500)
    }
}


module.exports = {
    userDetails,
    updateProfile,
    block,
    unblock,
    login
}