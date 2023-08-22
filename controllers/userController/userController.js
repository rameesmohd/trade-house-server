const bcrypt = require('bcrypt')
const {generateAuthToken} = require('../../middleware/auth');
const usermodel = require('../../model/userSchema');
let errMsg,msg;

const register = async(req,res)=>{
    try {
        let {name,email,mobile,password} = req.body
        console.log(name);
        const user = await usermodel.find({email: email});
        if(user.length){
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
            status : null,
        } , email,isMatch
        req.body.google ? email = req.body.payload.email : email = req.body.email
        const userDetails = await usermodel.findOne({ email: email })
        if (userDetails) {
            if(req.body?.password){
              isMatch = await bcrypt.compare(req.body.password,userDetails.password) 
            }
            if (isMatch || req.body.google) {
                response.token = generateAuthToken(userDetails);
                response.message = 'You have logged in';
                response.name = userDetails.name;
                response.user_id = userDetails._id
                response.status = true
                let token = response.token;
                let name = response.name;
                const obj = { token, name };

                res.cookie("jwt", obj, {
                    httpOnly: false,
                    maxAge: 6000 * 1000
                }).status(200).json({ response });
            } else {
                response.message = 'Password is wrong!!';
                res.status(400).json({ response });
            }
        } else {
            response.message = 'User does not exist!!';
            res.status(400).json({ response });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


const forgetPasswordAuth= async(req,res)=>{
    try {
        const user = await usermodel.findOne({email : req.query.email});
        user ? res.status(200).json({ msg:'user existed' }) : res.status(400).json({msg: 'user not exists,please signup'})
    } catch (error) {
        res.status(500).json({errMsg: 'Server side error'})
    }
}

const forgetPassword=async(req,res)=>{
    try {     
        const hashpassword = await bcrypt.hash(req.body.password,10)
        const email = req.body.email
        const reset = await usermodel.updateOne({email: email},{$set:{password : hashpassword}})
        reset ? res.status(200).json({msg:'password changed succesfully'}) :
        res.status(400).json({msg :'client side error'})
    } catch (error) {
        res.status(500).json({msg:'server side error'})
    }
}



module.exports = {
    register,
    login,
    forgetPasswordAuth,
    forgetPassword
}