import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../../socket';

const GameRules = () => {
  const { gameCode } = useParams();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const handleSettingsUpdate = (data) => {
      setSettings(data);
    };
    socket.on('settingsUpdate', handleSettingsUpdate);
    socket.emit('getSettings', { gameCode });
    
    return () => {
      socket.off('settingsUpdate', handleSettingsUpdate);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <p className="mt-6 text-center text-lg text-darkest font-bold border-b border-darker">{settings.lives} Lives / {settings.maxLives} Max Lives</p>
      <p className="text-center text-lg text-darkest font-bold border-b border-darker">{settings.timer}s</p>
      <p className="text-center text-lg text-darkest font-bold border-b border-darker">WPP {settings.difficulty}</p>
    </div>
  );
};

export default GameRules;