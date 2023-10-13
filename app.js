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
	origin: [
	  "http://localhost:5173",
	  "https://www.tradeh.online",
	  "https://tradeh.online", // Add your Vercel app origin here
	],
	methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
	allowedHeaders: ["Content-Type", "Authorization"],
    credentials:true, 
	optionsSuccessStatus: 200,
  };
  
  // Use the cors middleware with the specified options
  app.use(cors(corsOptions));


app.use(express.json({ limit: '3mb' }))
app.use(express.urlencoded({ limit: '3mb', extended: true }))
console.log('api called.......');



  

app.use('/admin',adminRouter)
app.use('/tutor',tutorRouter)
app.use('/',userRouter)

cron()
const server = app.listen(process.env.PORT,()=>console.log("Server started at port",process.env.PORT))
socket(server)
