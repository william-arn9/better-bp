// server/server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('./middleware/cors');
const chatSocket = require('./sockets/chatSocket');
const lobbySocket = require('./sockets/lobbySocket');
const gameSocket = require('./sockets/gameSocket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",  // Replace with your client's URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
  }
});

// Use cors middleware
app.use(cors);

io.on('connection', (socket) => {
  console.log('New client connected');

  chatSocket(socket, io);
  lobbySocket(socket, io);
  gameSocket(socket, io);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(4000, () => console.log('Server running on port 4000'));
