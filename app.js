const express = require('express')
const app = express()
const cors = require('cors')
const env = require('dotenv').config()
const connectDb = require('./config/db')
const userRouter = require('./routes/userRouter')
const adminRouter = require('./routes/adminRouter')
const tutorRouter = require('./routes/tutorRouter')
const socket = require('./services/socket')

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

const { spawn } = require('child_process');
const cronSchedule = spawn('node', ['cronSchedules.js']);

cronSchedule.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

cronSchedule.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

cronSchedule.on('close', (code) => {
    console.log(`Child process exited with code ${code}`);
})

const server = app.listen(process.env.PORT,()=>console.log("Server started at port",process.env.PORT))
socket(server)
