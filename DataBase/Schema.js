const validator = require('validator');
const { Schema } = require('mongoose')
const UserShema = {
    fullname: String,
    username: String,
    email: {
        type: String,
        validate: {
            validator: validator.isEmail,
            message: "Given Email is Not Valid"
        }
    },
    phone: {
        type: String,
        validate: {
            validator: validator.isMobilePhone,
            message: "Given Mobile Number is Not Valid"
        }
    },
    dob: String,
    password: String,
    profileimg: String,
    bio: String,
    gender: String,
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}


const PostSchema = {
    Userid: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    post_url: String,
    caption: String,
    liked: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    comments: [
        {
            user_data: {
                type: Schema.Types.ObjectId,
                ref: "User"
            },
            message: String
        }
    ]
}

const ChatSchema = {
    message: {
        from: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        to: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        text: String,
    },
    time: String
}
module.exports = { UserShema, PostSchema, ChatSchema }