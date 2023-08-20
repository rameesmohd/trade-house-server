const userModel = require('../model/userSchema')
const bcrypt = require('bcrypt')
const {generateAuthToken} = require('../middleware/auth')
let errMsg,msg;

const register = async(req,res)=>{
    try {
        let {name,email,mobile,password} = req.body
        console.log(name);
        const user = await userModel.find({email: email});
        if(user.length){
            const hashpassword = await bcrypt.hash(password,10)
            userModel.create({
                name: name,
                email: email.toLowerCase(),
                mobile: mobile,
                password: hashpassword
            }).then((data)=>{
                console.log('success',data);
            }).catch((error)=>{
                console.log(error);
            })
            res.status(200).json({ msg:'Registered successfully' })
        }else{
            res.status(400).json({errMsg: 'Email alredy exists'})
        }
    } catch (error) {
        res.status(500).json({errMsg: 'Server error'})
    }
}

const login =async(req,res)=>{
    try {
        let response = {
            status : false,
            message : null,
            token : null,
            name : null
        }
        const userDetails = await userModel.findOne({email : req.body.email})
        if(userDetails){
            const isMatch = bcrypt.compare(userDetails.password,req.body.password)
            if(isMatch){
                response.token = generateAuthToken(userDetails)
                response.status = true
                response.message = 'you have logged in'
                response.name = userDetails.name
                let token = response.token 
                let name = response.name
                const obj = {token,name}
                res.cookie("jwt",obj,{
                    httpOnly : false,
                    maxAge: 6000 * 1000}).status(200).json({ response })
            }else{
                response.message = 'password is wrong'
                response.status = false,
                res.json({ response })
            }
        }
    } catch (error) {
        res.json({ status: "failed",message: error.message });
    }
}

module.exports = {
    register,
    login
}