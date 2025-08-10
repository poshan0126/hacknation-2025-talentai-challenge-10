import React, { useState, useEffect } from 'react';

interface Candidate {
  id: string;
  name: string;
  score: number;
  challengesCompleted: number;
  accuracy: number;
  rank: number;
}

const LeaderboardSection: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data for now
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCandidates([
        { id: 'CAND_001', name: 'CAND_001', score: 950, challengesCompleted: 15, accuracy: 92.5, rank: 1 },
        { id: 'CAND_002', name: 'CAND_002', score: 920, challengesCompleted: 12, accuracy: 89.8, rank: 2 },
        { id: 'CAND_003', name: 'CAND_003', score: 890, challengesCompleted: 18, accuracy: 85.2, rank: 3 },
        { id: 'CAND_004', name: 'CAND_004', score: 875, challengesCompleted: 10, accuracy: 88.1, rank: 4 },
        { id: 'CAND_005', name: 'CAND_005', score: 860, challengesCompleted: 14, accuracy: 84.7, rank: 5 },
        { id: 'CAND_006', name: 'CAND_006', score: 845, challengesCompleted: 11, accuracy: 82.3, rank: 6 },
        { id: 'CAND_007', name: 'CAND_007', score: 830, challengesCompleted: 9, accuracy: 81.5, rank: 7 },
        { id: 'CAND_008', name: 'CAND_008', score: 815, challengesCompleted: 13, accuracy: 79.8, rank: 8 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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
      padding: '2rem', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      minHeight: '500px', // Prevent layout shift during loading
      position: 'sticky',
      top: '2rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          🏆 Top Candidates
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
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  Rank
                </th>
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'left', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  Candidate
                </th>
                <th style={{ 
                  padding: '0.75rem', 
                  textAlign: 'center', 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: '#374151',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  Score
                </th>
                <th style={{ 
                  padding: '0.75rem', 
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
              {candidates.map((candidate) => (
                <tr 
                  key={candidate.id}
                  style={{ 
                    borderBottom: '1px solid #f3f4f6',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '1rem 0.75rem' }}>
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
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <p style={{ margin: 0, fontWeight: '500', color: '#1f2937' }}>{candidate.name}</p>
                  </td>
                  <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '1rem',
                      color: candidate.score >= 900 ? '#10b981' : candidate.score >= 800 ? '#f59e0b' : '#6b7280'
                    }}>
                      {candidate.score}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.375rem',
                      backgroundColor: candidate.accuracy >= 90 ? '#dcfce7' : candidate.accuracy >= 80 ? '#fef3c7' : '#fee2e2',
                      color: candidate.accuracy >= 90 ? '#166534' : candidate.accuracy >= 80 ? '#92400e' : '#dc2626',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {candidate.accuracy}%
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </div>
  );
};

export default LeaderboardSection;