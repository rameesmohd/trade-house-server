const { generateTutorToken } = require('../../middleware/tutorAuth');
const userModel = require('../../model/userSchema')

const initialVerify =async(req,res)=>{
    try {
        const email = req.body.userEmail
        const tutor =  await userModel.findOne({email : email,is_tutor : true})
        if(tutor){
            const token = generateTutorToken(tutor._id)
            res.cookie("jwt", {token : token}, {
                httpOnly: false,
                maxAge: 6000 * 1000
            }).status(200).json({token : token})
        }else{
            res.status(400).json({message : 'Unautherised access!!'})
        }
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

module.exports= {
    initialVerify
}