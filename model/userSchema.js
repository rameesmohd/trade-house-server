const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            required : true,
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
            type : Number,
            required : true
        },
        password : {
            type : String,
            trim : true,
            requireed : true,
            minlength : [6]
        }
    }
)

const usermodel = mongoose.model('users',userSchema);
module.exports = usermodel