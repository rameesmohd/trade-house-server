const jwt = require('jsonwebtoken')
const usermodel = require('../model/userSchema')

const verifyToken = async (req, res, next) => {
    let token = req.header("Authorization");
    try {
        if (!token) return res.status(404).json({ message: "Authentication failed: no token provided." });
        if (token.startsWith("tutor")) {
            token = token.slice(6,token.length).trimLeft();
        }
        const verified = jwt.verify(token,process.env.JWTSECRETEKEY);
        req.user = verified;
        const user = await usermodel.findOne({_id:req.user._id,is_blocked:true})
        if(user){
            return res.status(403).json({ message: 'Access is blocked for this user.'});
        }
        if(req.user.role == 'tutor'){
            next();
        }else{
            return res.status(404).json({ message: "Authentication failed: invalid token." });
        }
    } catch (error) {
        return res.status(404).json({ message: "Authentication failed: invalid token." });
    }
};

const generateTutorToken = (user) => {
    const jwtSecretKey = process.env.JWTSECRETEKEY;
    const token = jwt.sign({ _id: user._id ,role : 'tutor'}, jwtSecretKey);
    return token;
}

module.exports = {
    generateTutorToken,
    verifyToken
}