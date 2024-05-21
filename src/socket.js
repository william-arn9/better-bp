// src/socket.js
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Replace with your server URL

socket.on('connect', () => {
  console.log('Connected to server');
});

export default socket;
