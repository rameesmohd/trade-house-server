const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    course_id: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'course',
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
    },
    status:{
        type : String,
        default : 'success'
    },
    is_refundable :{
        type: Boolean,
        default : true
    },
    user_message :{
        type: String
    },
    learning_progress :{
        type: Number,
        max : 100,
        default: 0
    }
})

const orderModel = mongoose.model('orders',orderSchema)
module.exports = orderModel
