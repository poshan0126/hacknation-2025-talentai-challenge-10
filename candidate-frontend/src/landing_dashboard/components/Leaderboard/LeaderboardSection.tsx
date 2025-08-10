import React, { useState, useEffect } from 'react';
import { useUser } from '../../../contexts/UserContext';

interface Candidate {
  user_id: string;
  display_name: string;
  total_score: number;
  challenges_completed: number;
  average_score: number;
  rank: number;
  total_bugs_found: number;
}

const LeaderboardSection: React.FC = () => {
  const { currentUser } = useUser();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('/debug/api/users/leaderboard');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold' };
      case 2: return { backgroundColor: '#e5e7eb', color: '#374151', fontWeight: 'bold' };
      case 3: return { backgroundColor: '#fed7aa', color: '#ea580c', fontWeight: 'bold' };
      default: return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '1rem', 
      padding: '1rem', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      minHeight: '500px', // Prevent layout shift during loading
      position: 'sticky',
      top: '2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          🏆 Leaderboard
        </h2>
        <span style={{ 
          padding: '0.25rem 0.75rem', 
          backgroundColor: '#dbeafe', 
          color: '#1e40af', 
          borderRadius: '1rem', 
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          Updated Live
        </span>
      </div>

      {loading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#6b7280',
          minHeight: '400px', // Match expected content height
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <p>Loading leaderboard...</p>
          
          {/* Skeleton loader to maintain layout */}
          <div style={{ width: '100%', marginTop: '2rem' }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ 
                height: '60px', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '0.5rem', 
                marginBottom: '0.5rem',
                opacity: 0.3 
              }} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <th style={{ 
                  padding: '0.75rem 0.5rem', 
                  textAlign: 'left', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  Rank
                </th>
                <th style={{ 
                  padding: '0.75rem 0.5rem', 
                  textAlign: 'left', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  Candidate
                </th>
                <th style={{ 
                  padding: '0.75rem 0.5rem', 
                  textAlign: 'center', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  Score
                </th>
                <th style={{ 
                  padding: '0.75rem 0.5rem', 
                  textAlign: 'center', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  Accuracy
                </th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => {
                const isCurrentUser = candidate.user_id === currentUser?.user_id;
                return (
                  <tr 
                    key={candidate.user_id}
                    style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background-color 0.2s',
                      backgroundColor: isCurrentUser ? '#f0f9ff' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentUser) {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentUser) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2rem',
                        height: '2rem',
                        borderRadius: '50%',
                        fontSize: '0.875rem',
                        ...getRankStyle(candidate.rank)
                      }}>
                        {getRankIcon(candidate.rank)}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <p style={{ 
                          margin: 0, 
                          fontWeight: isCurrentUser ? '600' : '500', 
                          color: isCurrentUser ? '#667eea' : '#1f2937',
                          fontFamily: 'monospace'
                        }}>
                          {isCurrentUser ? 'You' : candidate.user_id}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                      <span style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1rem',
                        color: candidate.total_score >= 900 ? '#10b981' : candidate.total_score >= 800 ? '#f59e0b' : '#6b7280'
                      }}>
                        {Math.round(candidate.total_score)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        backgroundColor: candidate.average_score >= 90 ? '#dcfce7' : candidate.average_score >= 80 ? '#fef3c7' : '#fee2e2',
                        color: candidate.average_score >= 90 ? '#166534' : candidate.average_score >= 80 ? '#92400e' : '#dc2626',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {Math.round(candidate.average_score)}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {candidates.length === 0 && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem', 
          color: '#6b7280'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏆</div>
          <p style={{ marginBottom: '1rem' }}>No one has completed challenges yet!</p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Complete your first challenge with a good score to appear on the leaderboard.
          </p>
        </div>
      )}

      {candidates.length > 0 && (
        <div style={{ 
          marginTop: '1.5rem', 
          padding: '1rem', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
            💡 Complete more challenges to climb the leaderboard!
          </p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardSection;