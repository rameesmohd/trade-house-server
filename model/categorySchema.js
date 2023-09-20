const mongoose = require('mongoose')


const categoryModel = new mongoose.Schema({
    category : {
        type : String,
        uppercase : true
    },
    is_flaged : {
        type : Boolean,
        default : false
    }
})

module.exports = mongoose.model('category',categoryModel)