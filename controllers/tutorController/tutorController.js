const { generateTutorToken } = require('../../middleware/tutorAuth');
const userModel = require('../../model/userSchema')
const cloudinary = require('../../config/cloudinary')
const fs = require('fs')


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

const addCourse=async(req,res)=>{
    try {
        const prevVideo = req.files?.preview[0]
        const banner = req.files?.banner[0]
        let prevVideoURL
        let bannerURL
        // console.log(req.body);

        if(prevVideo){
            const upload = await cloudinary.uploader.upload(prevVideo.path,{ resource_type: "video",
            public_id: "video_upload_example"
            }).then((data) => {
                console.log(data.playback_url);
                prevVideoURL = data.secure_url;
                fs.unlinkSync(prevVideo.path)
            }).catch((err) => {
                fs.unlinkSync(prevVideo.path)
                console.err(err)
            });
        }
        if(banner){
            const upload = await cloudinary.uploader.upload(banner.path)
            bannerURL = upload.secure_url;
            fs.unlinkSync(banner.path)
        }
        console.log(bannerURL);
        console.log(prevVideoURL);
            
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}

module.exports= {
    initialVerify,
    addCourse
}