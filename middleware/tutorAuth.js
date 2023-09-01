const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
    console.log('token verifying..');
    let token = req.header("Authorization");
    try {
        if (!token) return res.status(404).json({ message: "Authentication failed: no token provided." });
        if (token.startsWith("tutor")) {
            token = token.slice(6,token.length).trimLeft();
        }
        const verified = jwt.verify(token,process.env.JWTSECRETEKEY);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(404).json({ message: "Authentication failed: invalid token." });
    }
};

const generateTutorToken = (user) => {
    const jwtSecretKey = process.env.JWTSECRETEKEY;
    const token = jwt.sign({ _id: user._id }, jwtSecretKey);
    return token;
}

module.exports = {
    generateTutorToken,
    verifyToken
}