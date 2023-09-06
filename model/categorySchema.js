const mongoose = require('mongoose')


const categoryModel = new mongoose.Schema({
    category : {
        type : String
    },
    is_flaged : {
        type : Boolean,
        default : false
    }
})

module.exports = mongoose.model('category',categoryModel)