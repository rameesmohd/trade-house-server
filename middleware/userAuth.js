const jwt = require('jsonwebtoken')
const {OAuth2Client} = require('google-auth-library')
const oAuth2Client = new OAuth2Client(process.env.CLIENTID,process.env.SECRETID)

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

const verifyToken = async (req, res, next) => {
    let token = req.header("Authorization");
    try {
        if (!token) return res.status(404).json({ message: "Authentication failed: no token provided." });
        if (token.startsWith("Bearer")) {
            token = token.slice(7,token.length).trimLeft();
        }
        const verified = jwt.verify(token,process.env.JWTSECRETEKEY);
        req.user = verified;
        // console.log('tutor token verifying..');
        if(req.user.role == 'user'){
            next();
        }else{
            return res.status(404).json({ message: "Authentication failed: invalid token." });
        }
    } catch (error) {
        return res.status(404).json({ message: "Authentication failed: invalid token." });
    }
};

const generateAuthToken = (user) => {
    const jwtSecretKey = process.env.JWTSECRETEKEY;
    const token = jwt.sign({ _id: user._id, name: user.name, email: user.email, phone: user.phone ,role: 'user'}, jwtSecretKey);
    return token;
}


module.exports = {
    generateAuthToken,
    googleVerify,
    verifyToken
}