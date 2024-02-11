const express = require('express')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 8000
const route = require('../routes/apiroutes')
const { createServer } = require('http')
const socket = require('socket.io')
// const corsOptions = {
//     origin: 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     exposedHeaders: ['Content-Length'],
//     credentials: true
// };
// const corsOptions = {
//     origin: 'https://instagram-self-one.vercel.app',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     exposedHeaders: ['Content-Length'],
//     credentials: true
// };
const corsOptions = {
    origin: 'https://instaclonesahil.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length'],
    credentials: true
};


app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/api', route)

const server = createServer(app)

server.listen(PORT, () => {
    console.log(`Server Running at ${PORT}`)
})

const io = socket(server, {
    cors: {
        origin: 'http://localhost:5173',
    }
})
global.onlineuser = new Map()

io.on('connection', (socket) => {
    console.log("User was Connected")
    socket.on('add_user', (data) => {
        onlineuser.set(data, socket.id)
    })

    socket.on('send_msg', (data) => {
        const sendeduser = onlineuser.get(data.msg.to)
        if (sendeduser) {
            socket.to(sendeduser).emit('recived_msg', {
                text: data.msg.text,
                curr_time: data.curr_time
            })
        }
    })
    socket.on('disconnect', () => {
    })
})