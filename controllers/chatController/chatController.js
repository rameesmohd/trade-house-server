const { default: mongoose } = require("mongoose");
const chatModel = require("../../model/chatSchema");
const userModel = require("../../model/userSchema");
const messageModel = require("../../model/messageSchema");

const accessChat = async (req, res) => {
    try {
        const { other_id, user_role } = req.body;
        const other_role = user_role === 'user' ? 'tutor' : 'user';
        
        if (!other_id || !user_role) {
            return res.status(400).send('Bad Request');
        }
        
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const otherId = new mongoose.Types.ObjectId(other_id);
        
        const findQuery = {
            [user_role]: userId,
            [other_role]: otherId
        };

        const isChat = await chatModel.findOne(findQuery);
        if (isChat) {
            res.sendStatus(200);
        } else {
            const chatData = {
                [user_role]: userId,
                [other_role]: otherId
            };
            await chatModel.create(chatData);
            res.sendStatus(200);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


const fetchChats=async(req,res)=>{
    try {
        const {user_role}= req.query
        const user_id = new mongoose.Types.ObjectId(req.user._id);       
         
        const chats = await chatModel
        .find({ [user_role]: user_id })
        .populate({ path: 'user', select: 'name image email' })
        .populate({ path: 'tutor', select: 'name image email' })
        .populate({ path: 'latestMessage', populate: { path: 'sender', select: 'name image email' } })
        .sort({ updatedAt: -1 });

        res.status(200).json({result:chats})
    } catch (error) {
        console.log(error);
        return res.status(500)
    }
}

const sendMessage = async (messageData, chatId) => {
    try {
        const newMessage = {
            sender: new mongoose.Types.ObjectId(messageData.sender._id),
            content: messageData.content, 
            chat: new mongoose.Types.ObjectId(chatId)
        }
        let message = await messageModel.create(newMessage);
        await chatModel.findByIdAndUpdate(chatId, {
            latestMessage: message
        })
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

const allMessages = async(req,res)=>{
    try {
      const messages = await messageModel.find({chat : req.query.chatId})
        .populate("sender","name image email")
        .populate("chat")
         res.status(200).json({result:messages})
    } catch (error) {
        console.log(error);
        return res.status(500)
    }
}

module.exports = {
    accessChat,
    sendMessage,
    fetchChats,
    allMessages
}