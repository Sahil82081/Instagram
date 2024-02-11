const express = require('express')
const route = express.Router()
const usercontrollers = require('../Controllers/usercontrollers')
const { userauth } = require('../Middleware/userauth.js')
const { upload } = require('../Middleware/filemanager')


route.post('/register', usercontrollers.Register)
route.post('/login', usercontrollers.Login)
route.get('/profile', userauth, usercontrollers.Profile)
route.get('/profile/:id', userauth, usercontrollers.getprofile)
route.post('/upload/post', userauth, upload.single('fileupload'), usercontrollers.UploadPost)
route.get('/allposts', userauth, usercontrollers.AllPosts)
route.put('/upload/profileupdate', userauth, upload.single('fileupload'), usercontrollers.ProfileUpdate)
route.put('/like/post', userauth, usercontrollers.LikePost)
route.get('/preview/:id', userauth, usercontrollers.PreviewProfile)
route.get('/preview', userauth, usercontrollers.get_ALL_Users)
route.put('/follow', userauth, usercontrollers.Follow)
route.get('/getalluserschat', userauth, usercontrollers.get_All_User_Chat)
route.get('/allchat/:id', userauth, usercontrollers.AllChat)
route.post('/send_msg', userauth, usercontrollers.Send_Msg)

module.exports = route;