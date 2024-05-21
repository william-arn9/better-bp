import React, { useState, useEffect } from 'react';
import socket from '../../socket';

const Chat = () => {
  const [myUser, setMyUser] = useState('');
  const [lobbyPlayers, setLobbyPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState('chat');
  const [input, setInput] = useState('');

  useEffect(() => {
    setMyUser(sessionStorage.getItem('username'));
    socket.on('lobbyUpdate', (data) => {
      setLobbyPlayers(data.lobbyPlayers);
      setMessages(data.messageLog);
    });
    
    return () => {
      socket.off('receiveMessage');
    };
  });

  const handleSendMessage = () => {
    if (input.trim() !== '') {
      socket.emit('sendMessage', { user: myUser, message: input });
      setInput('');
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleTabClick = (e) => {
    setTab(e.target.id);
  };

  return (
    <div className="h-[calc(100vh-56px)] w-1/5 bg-darker flex flex-col">
      <div className="w-full">
        <button id="chat" className={`w-1/2 py-2 rounded-t-md border border-darkest bg-[#c2c3c4] ${tab === 'chat' ? '!bg-darker' : ''}`} onClick={handleTabClick}>Chat</button>
        <button id="players" className={`w-1/2 py-2 rounded-t-md border border-darkest bg-[#c2c3c4] ${tab === 'players' ? '!bg-darker' : ''}`} onClick={handleTabClick}>Players</button>
      </div>
      {tab === 'chat' && (
        <div className="h-full p-4 flex flex-col justify-end border border-darkest">
          <div clssName="h-full overflow-y-auto text-wrap break-all">
            {messages.map((message, index) => (
              <div key={index}>
                {message.user !== '$system' && (<span className="font-semibold">{message.user}: </span>)}{message.message}
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            <input
              type="text"
              className="w-full p-2 rounded-l-md border border-primary"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
            />
            <button className="p-1 text-primary font-bold bg-accent rounded-r-md" onClick={handleSendMessage}>Send</button>
          </div>
        </div>
      )}
      {tab === 'players' && (
        <div className="h-full p-4 flex flex-col items-center border border-darkest text-primary font-semibold">
          {lobbyPlayers.map((player, index) => (
            <div key={index} className={`${player.role === 'leader' ? 'text-purple-500' : ''}`}>
              { player.name }
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chat;
