const { default: mongoose } = require("mongoose");
const chatModel = require("../../model/chatSchema");
const userModel = require("../../model/userSchema");
const messageModel = require("../../model/messageSchema");

const accessChat = async(req,res)=>{
    try {
        const { other_role_id, user_role } = req.body;
        const other_role = user_role === 'user' ? 'tutor' : 'user';
        
        if (!id || !role) return res.status(400);
        
        const user_role_id = new mongoose.Types.ObjectId(req.user._id);

        const findQuery = {
            [user_role]: user_role_id,
            [other_role]: other_role_id
        };

        let isChat = await chatModel.findOne(findQuery)
            .populate({path : 'user',select : '-password'})
            .populate({path : 'tutor' ,select : '-password'})
            .populate({path : 'latestMessage'})
        
        isChat = await  userModel.populate(isChat,{
            path : "latestMessage.sender",
            select : 'name pic email'
        })

        if(isChat){
            res.status(200).json({result:isChat})
        }else{
            const chatData = {
                [user_role]: user_role_id,
                [other_role]: other_role_id
            }
            const createdChat = (await chatModel.create(chatData))
            .populate("user","name image")
            .populate("tutor","name image")
            .exec();
        }
        res.status(200).json({createdChat})
    } catch (error) {
        return res.status(500)
    }
}

const fetchChats=async(req,res)=>{
    try {
        const {user_role}= req.query
        const user_id = new mongoose.Types.ObjectId(req.user._id);        
        // const result = await chatModel.find({[user_role] : user_id})
        //     .populate({path : 'user',select : '-password'})
        //     .populate({path : 'tutor' ,select : '-password'})
        //     .populate({path : 'latestMessage'})
        //     .sort({updatedAt:-1})
        //     .then((async(result) =>{
        //         result = await User.populate(result,{
        //             path: "latestMessag.sender",
        //             select : "name pic email"
        //         })
        //     }))

        const chats = await chatModel
        .find({ [user_role]: user_id })
        .populate({ path: 'user', select: '-password' })
        .populate({ path: 'tutor', select: '-password' })
        .populate({ path: 'latestMessage', populate: { path: 'sender', select: 'name pic email' } })
        .sort({ updatedAt: -1 });

        res.status(200).json({chats})
    } catch (error) {
        console.log(error);
        return res.status(500)
    }
}

const sendMessage=async(req,res)=>{
    try {
    const { content ,chatId } = req.body
    const user_id = new mongoose.Types.ObjectId(req.user._id);

    if(!content || ! chatId){
        return res.status(400)
    }

    const newMessage = {
        sender : user_id,
        content :content,
        chat : new mongoose.Types.ObjectId(chatId)
    }


    
    let message = await messageModel.create(newMessage);
    
    console.log(message);
    message = await messageModel
    .findById(message._id)
    .populate("sender", "name image")
    .populate("chat")
    .populate({
        path: "chat.user",
        select: "name image email",
    })
    .populate({
        path: "chat.tutor",
        select: "name image email",
    })
    .exec();

    // Now 'message' is a Mongoose document with populated fields.


    await chatModel.findByIdAndUpdate(req.body.chatId,{
        latestMessage:message
    })
    console.log(message);
    res.json(message)
    } catch (error) {
        console.log(error);
        return res.status(500)
    }
}

const allMessages = async(req,res)=>{
    try {
      const messages = await messageModel.find({chat : req.query.chatId})
        .populate("sender","name image email")
        .populate("chat")
      res.status(200).json(messages)
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