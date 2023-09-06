const jwt = require('jsonwebtoken')

const verifyToken = async (req, res, next) => {
    let token = req.header("Authorization");
    try {
        if (!token) return res.status(404).json({ message: "Authentication failed: no token provided." });
        if (token.startsWith("admin")) {
            token = token.slice(6,token.length).trimLeft();
        }
        const verified = jwt.verify(token,process.env.JWTSECRETEKEY);
        req.user = verified;
        // console.log('admin token verifying..');
        if(req.user.role == 'admin'){
            next();
        }else{
            return res.status(404).json({ message: "Authentication failed: invalid token." });
        }
    } catch (error) {
        return res.status(404).json({ message: "Authentication failed: invalid token." });
    }
};

const generateAdminToken = (user) => {
    const jwtSecretKey = process.env.JWTSECRETEKEY;
    const token = jwt.sign({ _id: user._id,email: user.email,role : 'admin'}, jwtSecretKey);
    return token;
}

module.exports = {
    generateAdminToken,
    verifyToken
}