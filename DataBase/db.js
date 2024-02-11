const mongoose = require('mongoose')
const { UserShema, PostSchema, ChatSchema } = require('./Schema')
require('dotenv').config()
mongoose.connect(process.env.DATABASE_LINK).then(() => {
    console.log("Connected To DATABASE")
})


const User = mongoose.model('User', UserShema)
const Post = mongoose.model('Post', PostSchema)
const Chat = mongoose.model('Chat', ChatSchema)



module.exports = { User, Post, Chat }



