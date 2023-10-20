require('dotenv').config();

const session = require('express-session');

const sessionMiddleware = session({
    secret: "123abc",
    resave: false,
    saveUninitialized: true,
    cookie: {
        sameSite: 'strict',
    }
})

const socketConfig = expressMiddleware => (socket, next) =>
    expressMiddleware(socket.request, {}, next);


    module.exports = { sessionMiddleware, socketConfig };
