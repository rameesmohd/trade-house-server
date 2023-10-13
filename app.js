const express = require('express')
const app = express()
const cors = require('cors')
const env = require('dotenv').config()
const connectDb = require('./config/db')
const userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter')
const tutorRouter = require('./routes/tutorRouter')
const socket = require('./services/socket')
const cron = require('./services/cron')
connectDb()

const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
  
app.use(cors(corsOptions));
app.use(express.json({ limit: '3mb' }))
app.use(express.urlencoded({ limit: '3mb', extended: true }))

app.use('/admin',adminRouter)
app.use('/tutor',tutorRouter)
app.use('/',userRouter)

cron()
const server = app.listen(process.env.PORT,()=>console.log("Server started at port",process.env.PORT))
socket(server)
