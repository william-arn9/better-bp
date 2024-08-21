import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../../socket';

const INIT_SETTINGS = {
  visibility: 'public',
  timer: 5,
  lives: 2,
  maxLives: 3,
  difficulty: 500
};

const Settings = () => {
  const { gameCode } = useParams();
  const [settings, setSettings] = useState(INIT_SETTINGS);
  const [myUser, setMyUser] = useState({});

  useEffect(() => {
    const username = sessionStorage.getItem('username');

    const handleSettingsUpdate = (data) => {
      setSettings(data);
    };

    const handleAuth = (data) => {
      if (data.name === username) {
        setMyUser(data);
      }
    };

    socket.on('settingsUpdate', handleSettingsUpdate);
    socket.on('auth', handleAuth);

    socket.emit('authFetch', { gameCode, data: { username } });
    socket.emit('getSettings', { gameCode });
    
    return () => {
      socket.off('settingsUpdate', handleSettingsUpdate);
      socket.off('auth', handleAuth);
    };
  }, []);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const val = {
      ...settings,
      [name]: value,
    };
    socket.emit('updateSettings', { gameCode, data: val });
  };

  return (
    <form className="h-full flex flex-col p-4 rounded-tr-md border border-darkest bg-darker max-w-md mx-auto overflow-y-scroll">
      <h2 className="mb-12 text-center text-lg text-outline font-bold border-b border-darkest">Settings</h2>
      <label className="mb-4">
        <div className="flex mt-2">
          <label className={`w-1/2 p-2 flex justify-center items-center font-semibold text-outline bg-background border border-darkest rounded-l-lg cursor-pointer ${
            settings.visibility === 'public' ? '!text-primary bg-secondary' : ''
          }`}>
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={settings.visibility === 'public'}
              onChange={handleChange}
              className="mr-2 hidden"
              disabled={myUser?.role !== 'leader'}
            >
            </input>
            Public
          </label>
          <label className={`w-1/2 p-2 flex justify-center items-center font-semibold text-outline bg-background border border-darkest rounded-r-lg cursor-pointer ${
            settings.visibility === 'private' ? '!text-primary bg-secondary' : ''
          }`}>
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={settings.visibility === 'private'}
              onChange={handleChange}
              className="mr-2 hidden"
              disabled={myUser?.role !== 'leader'}
            />
            Private
          </label>
        </div>
      </label>
      <label className="mb-8">
        <span>Timer:</span>
        <input className="mx-4 my-2 p-2 text-lg" value={settings?.timer} type="text" disabled/>
        <input
          type="range"
          name="timer"
          min="1"
          max="10"
          value={settings?.timer}
          onChange={handleChange}
          className="w-full"
          style={{
            accentColor: '#aaaaac', // Change the color of the slider thumb and track
          }}
          disabled={myUser?.role !== 'leader'}
        />
      </label>
      <label className="mb-8">
        Lives:
        <input className="mx-4 my-2 p-2 text-lg" value={settings?.lives} type="text" disabled/>
        <input
          type="range"
          name="lives"
          min="1"
          max="5"
          value={settings?.lives}
          onChange={handleChange}
          className="w-full"
          style={{
            accentColor: '#aaaaac', // Change the color of the slider thumb and track
          }}
          disabled={myUser?.role !== 'leader'}
        />
      </label>
      <label className="mb-8">
        Max lives:
        <input className="mx-4 my-2 p-2 text-lg" value={settings?.maxLives} type="text" disabled/>
        <input
          type="range"
          name="maxLives"
          min="1"
          max="10"
          value={settings?.maxLives}
          onChange={handleChange}
          className="w-full"
          style={{
            accentColor: '#aaaaac', // Change the color of the slider thumb and track
          }}
          disabled={myUser?.role !== 'leader'}
        />
      </label>
      <label className="mb-2">
        Difficulty Level:
        <select
          name="difficulty"
          value={settings?.difficulty}
          onChange={handleChange}
          className="w-full rounded-md text-lg p-2 border rounded"
          disabled={myUser?.role !== 'leader'}
        >
          <option value={500}>Easy (Minimum 500 words per prompt)</option>
          <option value={300}>Medium (Minimum 300 words per prompt)</option>
          <option value={100}>Hard (Minimum 100 words per prompt)</option>
        </select>
      </label>
      <label className="mb-2">
        Bot Active:
        <input
          name="bot"
          type="checkbox"
          checked={settings?.bot}
          onChange={handleChange}
          disabled={myUser?.role !== 'leader'}
        />
      </label>
    </form>
  );
};

export default Settings;