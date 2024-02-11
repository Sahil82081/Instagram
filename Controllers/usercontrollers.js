const db = require('../DataBase/db.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const fs = require('fs')
const Cloudinary_upload = require('../Utility/cloudinary.js')
const { rejects } = require('assert')
const { resolve } = require('path')
module.exports.Register = async (req, res) => {
    try {
        const data = req.body
        const isuserexist = await db.User.findOne({ email: data.email })
        if (isuserexist) {
            return res.json({
                message: "Email is Already Exist"
            })
        }
        const hashpassword = await bcrypt.hash(data.password, 10)
        data.password = hashpassword
        const usersaved = await db.User(data).save()
        const token = jwt.sign({ id: usersaved._id }, process.env.SECRET_KEY)
        res.json({
            message: "Successfully Regsiter",
            token
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email && !password) {
            return res.json({
                error: "Enter a Email and Password"
            })
        }
        const userexist = await db.User.findOne({ email })
        if (userexist) {
            const result = await bcrypt.compare(password, userexist.password)
            if (result) {
                const token = jwt.sign({ id: userexist._id }, process.env.SECRET_KEY)
                res.status(200).json({
                    message: "Successfully Login",
                    token
                })
            } else {
                res.status(400).json({
                    error: "Enter a valid Email and Password "
                })
            }
        } else {
            res.status(400).json({
                error: "Enter a valid Email and Password "
            })
        }
    } catch (error) {
        res.status(500).json({
            error: error.message
        })

    }
}

module.exports.Profile = async (req, res) => {
    try {
        const userid = req.user.id
        const userdata = await db.User.findById(userid).populate('posts').populate({
            path: 'followers following',
            select: 'username profileimg'
        })
        res.status(200).json({
            userdata
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}
module.exports.getprofile = async (req, res) => {
    try {
        const id = req.params.id
        const userdata = await db.User.findById(id, { fullname: 1, username: 1, bio: 1, gender: 1, profileimg: 1 })
        res.status(200).json({
            userdata
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}


module.exports.UploadPost = async (req, res) => {
    try {
        const file = req.file
        const { caption } = req.body
        const post_data = await Cloudinary_upload(file.path)
        const Post = {
            Userid: req.user.id,
            post_url: post_data,
            caption,
        }
        const postsaved = await db.Post(Post).save()
        await db.User.findByIdAndUpdate(req.user.id, {
            $push: { posts: postsaved._id }
        }
        )
        fs.unlinkSync(file.path)
        res.status(200).json({
            message: "Successfully Updated"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })
    }

}


module.exports.AllPosts = async (req, res) => {
    try {
        const { id } = req.user
        const AllPost = await db.Post.find().populate('Userid')
        res.status(200).json({
            AllPost,
            req_userid: id
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

module.exports.ProfileUpdate = async (req, res) => {
    try {
        let data = req.body
        const { id } = req.user
        const file = req.file
        if (file) {
            const post_data = await Cloudinary_upload(file.path)
            data = {
                ...data,
                profileimg: post_data
            }
        } else {
            data = {
                ...data
            }
        }
        await db.User.findByIdAndUpdate(id, data)
        res.status(200).json({
            message: "Successfully Updated"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })

    }
}

module.exports.LikePost = async (req, res) => {
    try {
        const { id } = req.user
        const { status, postid } = req.body
        if (status) {
            await db.Post.findByIdAndUpdate(postid, {
                $push: {
                    liked: id
                }
            })
        }
        else {
            await db.Post.findByIdAndUpdate(postid, {
                $pull: {
                    liked: id
                }
            })
        }
        res.status(200).json({
            message: "Liked Post"
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })

    }
}

module.exports.PreviewProfile = async (req, res) => {
    try {
        const id = req.params.id
        const userid = req.user
        if (!id) {
            return res.status(400).json({ error: "ID is Missing" });
        }
        const userdata = await db.User.findById(id).populate('posts')
        res.status(200).json({
            userdata,
            req_userid: userid.id
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })

    }
}

module.exports.Follow = async (req, res) => {

    try {
        const user = req.user
        const { status, id } = req.body
        if (status) {
            await db.User.findByIdAndUpdate(user.id, {
                $push: {
                    following: id
                }
            })
            await db.User.findByIdAndUpdate(id, {
                $push: {
                    followers: user.id
                }
            })
        }
        else {
            await db.User.findByIdAndUpdate(user.id, {
                $pull: {
                    following: id
                }
            })
            await db.User.findByIdAndUpdate(id, {
                $pull: {
                    followers: user.id
                }
            })
        }
        res.status(200).json({
            message: "Followed Successfull"
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            error: error.message
        })
    }
}

module.exports.get_All_User_Chat = async (req, res) => {
    try {
        const { id } = req.user

        const users = await db.Chat.find({
            $or: [
                { 'message.from': id },
                { 'message.to': id }
            ]
        });
        if (users.length == 0) {
            return res.status(200).json({
                message: "No Chat Here"
            })
        }

        let all_ids = []
        const all_users = new Promise((resolve, rejects) => {
            const unique_ids = new Set()
            users.map((user) => {
                let to = ''
                if (user.message.from.toString() === id) {
                    to = user.message.to.toString()
                }
                else {
                    to = user.message.from.toString()
                }
                if (!unique_ids.has(to)) {
                    unique_ids.add(to)
                }
            })
            unique_ids.forEach((user) => {
                all_ids.push({ '_id': user })
            })
            resolve(all_ids)
        })

        all_users.then((data) => {
            let all_user;
            const fetch = async () => {
                all_user = await db.User.find({
                    $or: data
                }).select('username profileimg')
                res.status(200).json({ all_user });
            }
            fetch()
        })

    } catch (error) {
        res.status(500).json({
            error: "Something Went Wrong"
        })
    }
}

module.exports.AllChat = async (req, res) => {
    try {
        const { id } = req.user
        const user_chat_id = req.params.id

        const chat = await db.Chat.find({
            $or: [
                {
                    $and: [{ 'message.from': id }, { 'message.to': user_chat_id }]
                },
                {
                    $and: [{ 'message.from': user_chat_id }, { 'message.to': id }]
                }
            ]
        })
        const user_to = await db.User.findById(user_chat_id).select('username profileimg')
        const user_from = await db.User.findById(id).select('username profileimg')

        const all_chat = chat.map((userchat) => {
            const newMessage = { ...userchat.message, from: userchat.message.from.toString() === id };
            return { ...userchat.toObject(), message: newMessage };
        })
        res.status(200).json({
            user_to,
            user_from,
            all_chat
        })
    } catch (error) {
        res.status(500).json({
            error: "Something Went Wrong"
        })
    }
}

module.exports.Send_Msg = async (req, res) => {
    try {
        const { text, to, time } = req.body
        const { id } = req.user
        const msg = {
            message: {
                from: id,
                to,
                text
            },
            time
        }
        await db.Chat(msg).save()
        res.status(200).json({
            message: "Message Send Successfull"
        })
    } catch (error) {
        res.status(500).json({
            error: "Something Went Wrong"
        })
    }
}

module.exports.get_ALL_Users = async (req, res) => {
    try {
        const users = await db.User.find().select("username profileimg")
        res.status(200).json({
            users
        })
    } catch (error) {
        res.status(500).json({
            error: "Something Went Wrong"
        })

    }
}