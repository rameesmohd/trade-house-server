const mongoose = require('mongoose')

const moduleSchema = new mongoose.Schema({
    title : {
        type : String,
        require : true
    },
    courseId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'course'
    },
    chapters : [{
        chaptertitle : {
            type : String,
            require  :true
        },
        video : {
            type :String
        } 
        }
    ],
    image : { 
        type: String
    },
    notes : {
        type: String
    }
})

const moduleModel = mongoose.model('module',moduleSchema)
module.exports = moduleModel