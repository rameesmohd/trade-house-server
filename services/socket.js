const { sendMessage } = require('../controllers/chatController/chatController')

const socket = (server) => {
    const io = require('socket.io')(server, {
        pingTimeout: 60000,
        cors: {
            origin: "http://localhost:5173"
        }
    })
 
    io.on("connection", (socket) => {
        socket.on("error", (error) => {
            console.error("Socket error:", error);
        });

        socket.on("joinRoom", (chat_id, name) => {
            if (!chat_id) {
                console.error("Invalid chat_id");
                return;
            }
            socket.join(chat_id);
        })

        socket.on("newMessage", (message, chatId) => {
            console.log(chatId, message.sender.name, 'tessssst');
            if (!message || !chatId) {
                console.error("Invalid message or chatId");
                return;
            }
            socket.to(chatId).emit("messageResponse", message, chatId);
            sendMessage(message, chatId);
        });
        
    })

    

    // io.of("/chat").on("connection", (socket) => {

    //     socket.on("joinRoom", (chatId) => {
    //       socket.join(chatId);
    //     });

    //     socket.on("newMessage", (message, chatId,storeId) => {
    //       io.of("/chat").emit("messageResponse", message, chatId,storeId);
    //     });
      
    //     socket.on("read", (chatId, storeId) => {
    //       io.of("/chat").emit("readResponse", chatId, storeId);
    //     });

    //     socket.on("typing", (isTyping, Id, storeId) => {
    //       io.of("/chat").emit("typing", isTyping, Id, storeId);
    //     });
    //   });
}

module.exports = socket



