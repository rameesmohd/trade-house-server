const mongoose = require('mongoose')

const connectDB = async ()=>{
    await mongoose.connect(process.env.URL).then((res)=>{
            console.log(process.env.URL,'db connected');
    }).catch((err)=>{
            console.log('some error while connecting db');
    })
}

module.exports = connectDB