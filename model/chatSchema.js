const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    user :{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users'
    },
    tutor : {
        type : mongoose.Schema.Types.ObjectId,
        ref  : 'users'
    },
    latestMessage : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'message'
    }
},
{
    timestamps : true
}
)

const chatModel = mongoose.model('chat',chatSchema)
module.exports = chatModel