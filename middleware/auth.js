const jwt = require('jsonwebtoken')
const {OAuth2Client} = require('google-auth-library')
const oAuth2Client = new OAuth2Client(process.env.CLIENTID,
    process.env.SECRETID)

const googleVerify = async(req,res,next)=>{
    const authHeader = req.headers.authorization
    if(!authHeader){
        next(createError.Unauthorised())
    }
    const token = authHeader.split(' ')[1]
    const ticket  =await oAuth2Client.verifyIdToken({
        idToken : token,
        audience: process.env.CLIENTID
    })
    const payload = ticket.getPayload()
    if(payload){
        req.userId = payload['sub']
        next()
        return
    }
    next( createError.Unauthorised())
}

const generateAuthToken = (user) => {
    const jwtSecretKey = 't9rXw5bF2mS7zQ8p';
    const token = jwt.sign({ _id: user._id, name: user.name, email: user.email, phone: user.phone }, jwtSecretKey);
    return token;
}



module.exports = {
    generateAuthToken,
    googleVerify
}