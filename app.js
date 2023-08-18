const express = require('express')
const app = express()
const cors = require('cors')
const env = require('dotenv').config()
const connectDb = require('./config/db')
const userRouter = require('./routes/userRouter')

connectDb()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

console.log('entered in app...');
app.use('/',userRouter)

app.listen(process.env.PORT,()=>console.log("Server started at port",process.env.PORT))