const mongoose = require('mongoose')


const categoryModel = new mongoose.Schema({
    category : {
        type : String
    }
})

module.exports = mongoose.model('category',categoryModel)