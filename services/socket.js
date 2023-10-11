const { sendMessage } = require('../controllers/chatController/chatController')
const env = require('dotenv').config()
const fontendURl = process.env.FONTENDURL

const socket = (server) => {
    const io = require('socket.io')(server, {
        pingTimeout: 60000,
        cors: {
            origin: fontendURl
        }
    })
    
    io.on("connection", (socket) => {
        console.log('socketConnected');
        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });

        socket.on("initializeChat",(reciever,sender)=>{
            socket.join(reciever);
            io.to(reciever).emit('newInitialize',sender)
        })

        socket.on("joinRoom", (chat_id, sender_id) => {
           
            if (!chat_id) {
                console.error("Invalid chat_id");
                return;
            }
            socket.join(chat_id);
        })

        socket.on("typing",(chat_id)=>socket.to(chat_id).emit("typing"))

        socket.on("stoptyping",(chat_id)=>socket.to(chat_id).emit("stoptyping"))
        
        console.log('A user connected');
        
        socket.on('newMessage', (message, chatId) => {
          if (!message || !chatId) {
            console.error('Invalid message or chatId');
            return;
          }
          io.to(chatId).emit('messageResponse', message, chatId);
          sendMessage(message, chatId);
        });
    })
}

module.exports = socket



