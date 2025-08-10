import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';

const ChallengeCard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const startChallenge = async () => {
    if (!currentUser) {
      setAlertMessage('User not loaded yet. Please try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/debug/api/challenges/take-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUser.user_id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate challenge');
      }
      
      const challenge = await response.json();
      
      navigate('/play', { state: { challenge } });
      
    } catch (error) {
      console.error('Error generating challenge:', error);
      setAlertMessage('Failed to generate new challenge. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '1rem', 
        padding: '2rem', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          transform: 'translate(30px, -30px)'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐛</div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0, marginBottom: '0.5rem' }}>
              Debug Challenge Arena
            </h2>
            <p style={{ fontSize: '1rem', opacity: 0.9, margin: 0 }}>
              Test your debugging skills with AI-generated challenges
            </p>
          </div>

          <div style={{ 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            borderRadius: '0.75rem', 
            padding: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
              🎯 What You'll Get:
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', lineHeight: '1.6' }}>
              <li>AI-generated buggy code in Python</li>
              <li>Real-time feedback and scoring</li>
              <li>Detailed analysis of your debugging skills</li>
              <li>Leaderboard ranking against other candidates</li>
            </ul>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  borderRadius: '1rem',
                  fontSize: '0.75rem'
                }}>
                  ⏱️ ~10-15 min
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  borderRadius: '1rem',
                  fontSize: '0.75rem'
                }}>
                  🐍 Python
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  borderRadius: '1rem',
                  fontSize: '0.75rem'
                }}>
                  🏆 Points Available
                </span>
              </div>
            </div>

            <button
              onClick={startChallenge}
              disabled={isLoading}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                backgroundColor: isLoading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
                color: isLoading ? 'rgba(255,255,255,0.7)' : '#667eea',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                transition: 'all 0.2s',
                transform: 'translateY(0)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <span style={{ marginRight: '0.5rem' }}>🔄</span>
                  Generating Challenge...
                </>
              ) : (
                <>
                  <span style={{ marginRight: '0.5rem' }}>🚀</span>
                  Take Challenge
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Centered Alert Modal */}
      {alertMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
            <p style={{ 
              fontSize: '1.125rem', 
              color: '#1f2937', 
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              {alertMessage}
            </p>
            <button
              onClick={() => setAlertMessage(null)}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChallengeCard;