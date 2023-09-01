const express = require('express')
const app = express()
const cors = require('cors')
const env = require('dotenv').config()
const connectDb = require('./config/db')
const userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter')
const tutorRouter = require('./routes/tutorRouter')

connectDb()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use('/admin',adminRouter)
app.use('/tutor',tutorRouter)
app.use('/',userRouter)

app.listen(process.env.PORT,()=>console.log("Server started at port",process.env.PORT))

