import React, { useState } from 'react';
import ProfileSection from '../components/Profile/ProfileSection';
import LeaderboardSection from '../components/Leaderboard/LeaderboardSection';
import ChallengeCard from '../components/ChallengeSection/ChallengeCard';

interface ResumeUploadCardProps {
  title: string;
  subtitle: string;
  acceptedTypes: string;
  icon: string;
  color: string;
}

const ResumeUploadCard: React.FC<ResumeUploadCardProps> = ({ title, subtitle, acceptedTypes, icon, color }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <div style={{ 
      border: `2px dashed ${isDragging ? color : '#d1d5db'}`,
      borderRadius: '0.75rem',
      padding: '1.5rem',
      textAlign: 'center',
      backgroundColor: isDragging ? `${color}10` : uploadedFile ? '#f0fdf4' : '#ffffff',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative'
    }}
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    >
      <input
        type="file"
        accept={acceptedTypes}
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        id={`upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
      />
      
      {uploadedFile ? (
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#22c55e' }}>✅</div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#166534', margin: '0 0 0.5rem 0' }}>
            File Uploaded Successfully!
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#166534', margin: '0 0 1rem 0', wordBreak: 'break-word' }}>
            📎 {uploadedFile.name}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button
              onClick={() => setUploadedFile(null)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              🗑️ Remove
            </button>
            <label
              htmlFor={`upload-${title.replace(/\s+/g, '-').toLowerCase()}`}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: color,
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                display: 'inline-block'
              }}
            >
              🔄 Replace
            </label>
          </div>
        </div>
      ) : (
        <label htmlFor={`upload-${title.replace(/\s+/g, '-').toLowerCase()}`} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#374151', margin: '0 0 0.5rem 0' }}>
            {title}
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 1rem 0' }}>
            {subtitle}
          </p>
          <div style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: color,
            color: 'white',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}>
            📤 Click or Drag to Upload
          </div>
        </label>
      )}
    </div>
  );
};

const CandidateDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'history'>('dashboard');

  const handleTabChange = (tab: 'dashboard' | 'profile' | 'history') => {
    setActiveTab(tab);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb'
    }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
        marginBottom: '2rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div>
                <h1 style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: '#667eea', 
                  margin: 0,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  display: 'inline-block',
                  minWidth: 'max-content'
                }}>
                  TalentAI Dashboard
                </h1>
                <p style={{ color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                  Welcome back! Track your progress and take new challenges
                </p>
              </div>
              
              {/* Quick Upload Indicator */}
              <div style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '0.75rem', 
                border: '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1rem' }}>📄</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600', color: '#0c4a6e' }}>
                    Profile Status
                  </p>
                  <p style={{ margin: 0, fontSize: '0.625rem', color: '#0369a1' }}>
                    Resume: Not Uploaded
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => handleTabChange('dashboard')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  backgroundColor: activeTab === 'dashboard' ? '#667eea' : '#e5e7eb',
                  color: activeTab === 'dashboard' ? 'white' : '#374151',
                  transition: 'all 0.2s'
                }}
              >
                🏠 Dashboard
              </button>
              <button
                onClick={() => handleTabChange('profile')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  backgroundColor: activeTab === 'profile' ? '#667eea' : '#e5e7eb',
                  color: activeTab === 'profile' ? 'white' : '#374151',
                  transition: 'all 0.2s'
                }}
              >
                👤 Profile
              </button>
              <button
                onClick={() => handleTabChange('history')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  backgroundColor: activeTab === 'history' ? '#667eea' : '#e5e7eb',
                  color: activeTab === 'history' ? 'white' : '#374151',
                  transition: 'all 0.2s'
                }}
              >
                📊 History
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        maxWidth: '1200px', 
        width: '100%',
        margin: '0 auto', 
        padding: '0 2rem',
        boxSizing: 'border-box'
      }}>
        {activeTab === 'dashboard' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '2fr 1fr', 
            gap: '2rem',
            minHeight: '500px' // Prevent layout shift
          }}>
            {/* Left Column */}
            <div style={{ 
              minWidth: '0', // Allow flex shrinking
              width: '100%'   // Maintain consistent width
            }}>
              <ChallengeCard />
              
              {/* Resume Upload Section */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '1rem', 
                padding: '2rem', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginBottom: '2rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                    📄 Resume & Documents
                  </h2>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem' }}>
                    Upload your resume and portfolio documents to complete your profile
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Resume Upload */}
                  <div>
                    <ResumeUploadCard 
                      title="📄 Resume/CV"
                      subtitle="PDF, DOC, DOCX (Max 5MB)"
                      acceptedTypes=".pdf,.doc,.docx"
                      icon="📄"
                      color="#667eea"
                    />
                  </div>
                  
                  {/* Portfolio Upload */}
                  <div>
                    <ResumeUploadCard 
                      title="💼 Portfolio"
                      subtitle="PDF, ZIP, or URL (Max 10MB)"
                      acceptedTypes=".pdf,.zip"
                      icon="💼"
                      color="#764ba2"
                    />
                  </div>
                </div>

                {/* Upload Status */}
                <div style={{ 
                  marginTop: '1.5rem', 
                  padding: '1rem', 
                  backgroundColor: '#f0f9ff', 
                  borderRadius: '0.75rem',
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>📊</span>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#0c4a6e', margin: 0 }}>
                      Profile Completion Status
                    </h3>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flex: 1, backgroundColor: '#e0e7ff', borderRadius: '1rem', height: '0.5rem', overflow: 'hidden' }}>
                      <div style={{ 
                        width: '65%', 
                        height: '100%', 
                        backgroundColor: '#667eea',
                        borderRadius: '1rem',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#667eea' }}>65%</span>
                  </div>
                  
                  <p style={{ fontSize: '0.75rem', color: '#0c4a6e', margin: '0.5rem 0 0 0' }}>
                    Complete your profile by uploading your resume and portfolio
                  </p>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '1rem', 
                padding: '2rem', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginBottom: '2rem'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 1.5rem 0' }}>
                  🎯 Recent Achievements
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🏆</span>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Completed "Binary Search Debug" with 95% accuracy
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>🎯</span>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Found 3 critical bugs in "Array Processing Challenge"
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>⚡</span>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Fastest completion time: 8 minutes 32 seconds
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ 
              minWidth: '300px', // Minimum width to prevent compression
              maxWidth: '400px'  // Maximum width to prevent expansion
            }}>
              {/* Your Progress - Moved to top right */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '1rem', 
                padding: '2rem', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginBottom: '2rem',
                position: 'sticky',
                top: '2rem'
              }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 1.5rem 0' }}>
                  📈 Your Progress
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '1rem', 
                    backgroundColor: '#f0f9ff', 
                    borderRadius: '0.75rem',
                    border: '1px solid #bae6fd'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '0.5rem' }}>
                      8
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#0c4a6e', fontWeight: '500' }}>
                      Challenges Completed
                    </p>
                  </div>
                  
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '1rem', 
                    backgroundColor: '#f0fdf4', 
                    borderRadius: '0.75rem',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '0.5rem' }}>
                      725
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#14532d', fontWeight: '500' }}>
                      Total Score
                    </p>
                  </div>
                  
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '1rem', 
                    backgroundColor: '#fef3c7', 
                    borderRadius: '0.75rem',
                    border: '1px solid #fde68a'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
                      87%
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e', fontWeight: '500' }}>
                      Accuracy Rate
                    </p>
                  </div>
                </div>
              </div>

              <LeaderboardSection />
              
              {/* Current User Position */}
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '1rem', 
                padding: '1.5rem', 
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                marginTop: '1rem',
                background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                border: '1px solid #c4b5fd',
                position: 'sticky',
                top: '28rem'
              }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: 'bold', 
                  color: '#581c87', 
                  margin: '0 0 1rem 0',
                  textAlign: 'center'
                }}>
                  🎯 Your Position
                </h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>#9</div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#581c87' }}>Rank</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>725</div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#581c87' }}>Points</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>87%</div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#581c87' }}>Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            width: '100%'
          }}>
            <ProfileSection />
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '1rem', 
            padding: '2rem', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 1.5rem 0' }}>
              📊 Challenge History
            </h2>
            
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📈</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
                Challenge History Coming Soon
              </h3>
              <p style={{ margin: 0 }}>
                Track your performance over time, review past challenges, and analyze your debugging patterns.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CandidateDashboard;