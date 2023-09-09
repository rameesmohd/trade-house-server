const bcrypt = require('bcrypt')
const {generateAuthToken} = require('../../middleware/userAuth');
const usermodel = require('../../model/userSchema');
const nodeMailer = require('nodemailer')
const fs = require('fs')
const cloudinary = require('../../config/cloudinary');
const courseModel = require('../../model/courseSchema');
let errMsg,msg;

const register = async(req,res)=>{
    try {
        let {name,email,mobile,password} = req.body
        console.log(name);
        const user = await usermodel.find({email: email});
        if(!user.length){
            const hashpassword = await bcrypt.hash(password,10)
            usermodel.create({
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
                res.status(400).json({ response }) }
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
                res.cookie("jwt", obj, {
                    httpOnly: false,
                    maxAge: 6000 * 1000
                }).status(200).json({ response });
            } else {
                response.message = 'Password is wrong!!';
                res.status(400).json({ response });
            }
        }
        } else{
            response.message = 'User does not exist!!';
            res.status(400).json({ response });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        console.log('edfsedf');
        const courses = await courseModel.find({is_active:true}).populate('tutor').populate('category')
        courses ? res.status(200).json({result : courses}) : res.status(500)
    } catch (error) {
        console.log(error.message);
        res.status(500)
    }
}
module.exports = {
    register,
    login,
    forgetPasswordAuth,
    forgetPassword,
    submitRequest,
    allCourses
}