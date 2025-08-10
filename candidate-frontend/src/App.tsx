import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CandidateDashboard from './landing_dashboard/pages/CandidateDashboard';
import ChallengePlayPage from './challenge_play/pages/ChallengePlayPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CandidateDashboard />} />
        <Route path="/play" element={<ChallengePlayPage />} />
        <Route path="/debug/*" element={<CandidateDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;