const userModel = require('../../model/userSchema')

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
        console.log(req.body);

    } catch (error) {
        
    }
}

module.exports = {
    userDetails,
    updateProfile
}