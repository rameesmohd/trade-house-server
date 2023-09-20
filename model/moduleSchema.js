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
        chapter_title : {
            type : String,
            require :true
        },
        video : {
            type :String
        },
        watched_by_users :[
            {
                user_id : {
                    type :mongoose.Schema.Types.ObjectId,
                    ref : 'users'
                },
                watched_users : {
                    type : Array
                }
            }
        ]}
    ],
    notes : {
        type: String
    },
    completed_users: {
        type : Array
    }
})

const moduleModel = mongoose.model('module',moduleSchema)
module.exports = moduleModel