const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
    {
        name : {
            type : String,
            trim : true,
            uppercase : true
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
        image: {
            type : String
        },
        wallet : {
            type : Number,
            default : 0.00
        },
        //<<<<<<-------------tutor----------->>>>>>>>
        firstName :{
            type : String
        },
        lastName : {
            type : String
        },
        is_admin : {
            type : Boolean,
            default : false
        },
        is_tutor : {
            type : Boolean,
            default : false
        },
        is_requested : {
            type : Boolean,
            default : false
        },
        req_status : {
            type : String
        },
        experience :{
            type : Number
        },
        qualification :{
            type: String
        },
        category : {
            type : String
        },
        CV : {
            type : String
        },
        type_of_trader :{
            type : String
        },
        about_me :{
            type : String
        },
        b_wallet_balance :{
            type: Number,
            default : 0
        },
        b_wallet_transaction:[
            {
                order_id:{
                    type:mongoose.Types.ObjectId 
                },
                amount:{
                    type: Number,
                    require : true
                },
                transaction_type :{
                    type : String,
                    require : true
                },
                date:{
                    type : Date,
                    requires : true
                }
            }
        ]
    }
)

const usermodel = mongoose.model('users',userSchema);
module.exports = usermodel