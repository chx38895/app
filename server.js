const express = require('express');
const db = require('./controllers/dbContext.js');
const registerRoute = require('./routes/registerRoute');
const loginRoute = require('./routes/loginRoute');
const contactsRoute = require('./routes/contactsRoute.js');
const messageRoute = require('./routes/messageRoute.js');
const isAuth = require('./isAuth');
const dotenv = require('dotenv');
const app = express();
const port = process.env.PORT || 3000;
const {
  sessionMiddleware,
  socketConfig,
} = require("./controllers/serverController");


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


const {Server} = require('socket.io');
const server = require('http').createServer(app);
const io = new Server(server);

dotenv.config();

app.use(sessionMiddleware);

io.use(socketConfig(sessionMiddleware));
io.use((socket, next) => {
  const auth = socket.request.session.userData;  
  if (auth) {
    next();
  } else {
    next(new Error("unauthorized"));    
  }
})

io.on('connection', socket => {
  const userId = socket.request.session.userData.userId;
  const username = socket.request.session.userData.username;
  socket.join(userId);

  socket.on('sendMessage', (messageData) => {
    const content = messageData.content;

    const eventData = {
      sender_id: userId,
      sender_username: username,
      content: content
    }
    io.to(messageData.recipient).emit('receiveMessage', eventData);

  });
  socket.on('disconnect', () => {
    io.to(userId).emit('left', userId);
});
});


app.get('/check-auth', (req, res) => {
  if (req.session && req.session.userData) {
    res.status(200).send('Authenticated');
  } else {
    res.status(401).send('Not authenticated');
  }
});

app.post("/logout", (req, res) => {
  const userRoom = req.session.userData.userId

  req.session.destroy(() => {
    new Error("unauthorized")
    io.to(userRoom).emit('left');
    res.status(204).end();
  });
});

app.use('/login', loginRoute);
app.use('/register', registerRoute);

app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});
app.use('/contacts', isAuth, contactsRoute);
app.use('/message', isAuth, messageRoute);

app.get('*', (req, res) => {
  res.redirect('/');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});