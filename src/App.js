// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game'; // Assuming you have a Game component
import Header from './components/widgets/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/en-US/lobby" element={<Lobby />} />
        <Route path="/en-US/game/:gameCode" element={<Game />} />
        <Route path="/en-US/home" element={<Home />} />
        <Route path="*" element={<Navigate to="/en-US/home" />} />
      </Routes>
    </Router>
  );
}

export default App;
