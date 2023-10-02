const mongoose = require('mongoose')


const categorySchema = new mongoose.Schema({
    category : {
        type : String,
        uppercase : true
    },
    is_flaged : {
        type : Boolean,
        default : false
    }
})

const categoryModel =  mongoose.model('category',categorySchema)
module.exports = categoryModel