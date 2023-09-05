const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
    let token = req.header("Authorization");
    try {
        if (!token) return res.status(404).json({ message: "Authentication failed: no token provided." });
        if (token.startsWith("tutor")) {
            token = token.slice(6,token.length).trimLeft();
        }
        const verified = jwt.verify(token,process.env.JWTSECRETEKEY);
        req.user = verified;
        console.log('tutor token verifying..');
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