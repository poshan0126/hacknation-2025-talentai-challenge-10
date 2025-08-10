import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CandidateDashboard from './landing_dashboard/pages/CandidateDashboard';
import ChallengePlayPage from './challenge_play/pages/ChallengePlayPage';
import { UserProvider } from './contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<CandidateDashboard />} />
          <Route path="/play" element={<ChallengePlayPage />} />
          <Route path="/debug/*" element={<CandidateDashboard />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;