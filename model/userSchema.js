const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            trim : true
        },
        email : {
            type: String,
            required :true,
            unique : true,
            lowercase : true,
            trim : true
        },
        mobile:{
            type : Number
        },
        password : {
            type : String,
            trim : true,
            minlength : [6]
        },
        is_blocked : {
            type : Boolean,
            default : false
        },
        is_admin : {
            type : Boolean,
            default : false
        },
        is_tutor : {
            type : Boolean,
            default : false
        }
    }
)

const usermodel = mongoose.model('users',userSchema);
module.exports = usermodel