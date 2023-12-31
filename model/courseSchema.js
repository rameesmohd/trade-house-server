const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title : {
        type : String
    },
    level : {
        type : String
    },
    duration : {
        type : Number
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'category'
    },
    description :{
        type : String
    },
    skillsOffering : {
        type : Array
    },
    preview : {
        type : String
    },
    banner : {
        type : String
    },
    tutor : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users'
    },
    is_active :{
        type: Boolean,
        default : false
    },
    price : {
        type : Number
    }, 
    user_ratings :[
        {
            user_id : {
                type : mongoose.Schema.Types.ObjectId,
                ref : 'users'
            },
            user_name :{
                type : String
            },
            rating : {
                type : Number                
            },
            review : {
                type: String
            },
            date:{
                type: Date
            }
        }
    ],
    total_rating : {
        type : Number
    },
    total_purchases :{
        type : Number,
        default : 0
    }
})

const courseModel = mongoose.model('course',courseSchema)
module.exports = courseModel