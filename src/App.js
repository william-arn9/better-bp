// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Lobby from './components/Lobby';
import Game from './components/Game'; // Assuming you have a Game component
import Header from './components/widgets/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/lobby" element={<Lobby />} />
        <Route path="/game" element={<Game />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
