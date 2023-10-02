const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
    email : {
        type : String
    },
    subject : { 
        type : String
    },
    comment  : {
        type : String
    },
    date : {
        type : Date
    },
    is_read :{
        type : Boolean,
        default : false
    }
})

const contactModel = mongoose.model('contact',contactSchema)
module.exports = contactModel