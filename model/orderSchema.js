const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    course_id: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'courses',
        require : true
    },
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'users',
        require : true
    },
    payment_mode : {
        type : String,
        require : true
    },
    date_of_purchase :{
        type : Date,
        require : true
    },
    amount : {
        type : Number,
        require : true
    }
})

const orderModel = mongoose.model('orders',orderSchema)
module.exports = orderModel
