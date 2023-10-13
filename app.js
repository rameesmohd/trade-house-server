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

app.use(cors({
    origin: ["http://localhost:5173", "https://www.tradeh.online"],
    methods: "GET,PUT,POST,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
    optionsSuccessStatus: 204 // Indicate that preflight requests should return a status code of 204
  }));
  
  // Define a middleware specifically for handling preflight requests
  app.options('*', (req, res) => {
    res.status(204).send();
  })


app.use(express.json({ limit: '3mb' }))
app.use(express.urlencoded({ limit: '3mb', extended: true }))
// cron()
console.log('api called.......');
  
app.use('/admin',adminRouter)
app.use('/tutor',tutorRouter)
app.use('/',userRouter)

const server = app.listen(process.env.PORT,()=>console.log("Server started at port",process.env.PORT))
socket(server)
