// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { generateRandomFourDigitNumber } from '../../services/Generators';

const Header = () => {
  const [username, setUsername] = useState('');
  const [inputValue, setInputValue] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      setInputValue(storedUsername);
    } else {
      const num = generateRandomFourDigitNumber();
      const guestUsername = `Guest${num}`;
      setUsername(guestUsername);
      setInputValue(guestUsername);
      sessionStorage.setItem('username', guestUsername);
    }
  }, []);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSetName = () => {
    setUsername(inputValue);
    sessionStorage.setItem('username', inputValue);
  };

  const handleNavigate = () => {
    navigate('/en-US/home');
  };

  return (
    <nav className="h-14 p-3 bg-secondary flex justify-between">
      <h1 className="text-primary font-bold cursor-pointer" onClick={handleNavigate}>Welcome to BombParty</h1>
      <div className="flex h-8">
        <p className="text-primary mt-1 mr-4">Hi, <span className="font-bold">{username}</span>.</p>
        {location.pathname === '/' && (
          <>
            <input
              type="text"
              className="p-2 rounded-l-md border border-primary"
              placeholder="User"
              value={inputValue}
              onChange={handleInputChange}
            />
            <button
              className="p-1 text-primary font-bold bg-accent rounded-r-md"
              onClick={handleSetName}
            >
              Set Name
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Header;
