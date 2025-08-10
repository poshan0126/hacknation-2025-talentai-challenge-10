import React, { useState, useEffect } from 'react';
import ProfileSection from '../components/Profile/ProfileSection';
import LeaderboardSection from '../components/Leaderboard/LeaderboardSection';
import ChallengeCard from '../components/ChallengeSection/ChallengeCard';
import { useUser } from '../../contexts/UserContext';
import UserDropdown from '../../components/UserSelector/UserDropdown';

interface ResumeUploadCardProps {
  title: string;
  subtitle: string;
  acceptedTypes: string;
  icon: string;
  color: string;
  userId: string;
  onUploadSuccess?: (data: any) => void;
}

const ResumeUploadCard: React.FC<ResumeUploadCardProps> = ({ title, subtitle, acceptedTypes, icon, color, userId, onUploadSuccess }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedData, setUploadedData] = useState<any>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    // Only upload resume/CV files to backend
    if (title.includes('Resume') && (file.name.endsWith('.pdf') || file.name.endsWith('.md') || file.name.endsWith('.txt'))) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch(`/resume/api/user-resume/upload/${userId}`, {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUploadedFile(file);
            setUploadedData(result.data);
            if (onUploadSuccess) {
              onUploadSuccess(result.data);
            }
            alert('Resume uploaded and parsed successfully!');
          }
        } else {
          alert('Failed to upload resume');
        }
      } catch (error) {
        console.error('Error uploading resume:', error);
        alert('Error uploading resume');
      } finally {
        setIsUploading(false);
      }
    } else {
      // For portfolio and non-PDF files, just store locally
      setUploadedFile(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
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
            {isUploading ? '⏳ Uploading...' : '📤 Click or Drag to Upload'}
          </div>
        </label>
      )}
    </div>
  );
};

interface ChallengeHistory {
  challenge_id: string;
  title: string;
  difficulty: string;
  language: string;
  attempts: number;
  best_score: number;
  completed: boolean;
  created_at: string;
  last_attempted: string | null;
  time_spent_seconds: number;
  best_submission?: {
    score: number;
    bugs_found: number;
    bugs_missed: number;
    submitted_at: string;
  };
}

interface UserHistory {
  user_id: string;
  display_name: string;
  email: string;
  statistics: {
    total_score: number;
    challenges_completed: number;
    challenges_attempted: number;
    average_score: number;
    highest_score: number;
    total_bugs_found: number;
    total_bugs_missed: number;
    average_time_seconds: number;
    member_since: string;
    last_active: string;
  };
  history: ChallengeHistory[];
}

const CandidateDashboard: React.FC = () => {
  const { currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'history'>('dashboard');
  const [userHistory, setUserHistory] = useState<UserHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Clear cached data when user changes
      setUserStats(null);
      setUserRank(null);
      setUserHistory(null);
      setResumeData(null);
      setHasResume(false);
      
      fetchUserStats();
      fetchUserRank();
      fetchResumeStatus();
    }
  }, [currentUser]);

  const fetchUserStats = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/debug/api/users/${currentUser.user_id}/profile`);
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchUserRank = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch('/debug/api/users/leaderboard');
      if (response.ok) {
        const data = await response.json();
        const userEntry = data.find((entry: any) => entry.user_id === currentUser.user_id);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      }
    } catch (error) {
      console.error('Error fetching user rank:', error);
    }
  };

  const fetchResumeStatus = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/resume/api/user-resume/profile/${currentUser.user_id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.has_resume) {
          setResumeData(result.data);
          setHasResume(true);
        }
      }
    } catch (error) {
      console.error('Error fetching resume status:', error);
    }
  };

  const handleResumeUploadSuccess = (data: any) => {
    setResumeData(data);
    setHasResume(true);
  };

  const handleTabChange = (tab: 'dashboard' | 'profile' | 'history') => {
    setActiveTab(tab);
    if (tab === 'history' && !userHistory) {
      fetchUserHistory();
    }
  };

  const fetchUserHistory = async () => {
    if (!currentUser) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/debug/api/users/${currentUser.user_id}/history`);
      if (response.ok) {
        const data = await response.json();
        setUserHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds) return '0m';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Not attempted';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p style={{ fontSize: '1.125rem', color: '#6b7280' }}>Loading user data...</p>
        </div>
      </div>
    );
  }

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
                backgroundColor: hasResume ? '#f0fdf4' : '#f0f9ff', 
                borderRadius: '0.75rem', 
                border: `1px solid ${hasResume ? '#bbf7d0' : '#bae6fd'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1rem' }}>{hasResume ? '✅' : '📄'}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600', color: hasResume ? '#14532d' : '#0c4a6e' }}>
                    Profile Status
                  </p>
                  <p style={{ margin: 0, fontSize: '0.625rem', color: hasResume ? '#15803d' : '#0369a1' }}>
                    Resume: {hasResume ? 'Uploaded' : 'Not Uploaded'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation Tabs and User Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
              
              {/* User Selector */}
              <UserDropdown />
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
                      subtitle="PDF, MD, TXT (Max 5MB)"
                      acceptedTypes=".pdf,.md,.txt"
                      icon="📄"
                      color="#667eea"
                      userId={currentUser?.user_id || ''}
                      onUploadSuccess={handleResumeUploadSuccess}
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
                      userId={currentUser?.user_id || ''}
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
                        width: hasResume ? '85%' : '65%', 
                        height: '100%', 
                        backgroundColor: '#667eea',
                        borderRadius: '1rem',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#667eea' }}>{hasResume ? '85%' : '65%'}</span>
                  </div>
                  
                  <p style={{ fontSize: '0.75rem', color: '#0c4a6e', margin: '0.5rem 0 0 0' }}>
                    {hasResume ? 'Great! Upload your portfolio to complete your profile' : 'Complete your profile by uploading your resume and portfolio'}
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
                      {userStats ? userStats.challenges_completed : 0}
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
                      {userStats ? Math.round(userStats.total_score) : 0}
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
                      {userStats ? `${Math.round(userStats.average_score)}%` : '0%'}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e', fontWeight: '500' }}>
                      Average Score
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
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                      {userRank ? `#${userRank}` : 'N/A'}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#581c87' }}>Rank</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                      {userStats ? Math.round(userStats.total_score) : 0}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#581c87' }}>Points</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                      {userStats ? `${Math.round(userStats.average_score)}%` : '0%'}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#581c87' }}>Avg Score</p>
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
          <div>
            {/* Statistics Summary */}
            {userHistory && (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(4, 1fr)', 
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '1.5rem', 
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                  border: '1px solid #bae6fd'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '0.5rem' }}>
                    {userHistory.statistics.challenges_attempted}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#0c4a6e', fontWeight: '500' }}>
                    Challenges Attempted
                  </p>
                </div>
                
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '1.5rem', 
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '0.5rem' }}>
                    {userHistory.statistics.challenges_completed}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#14532d', fontWeight: '500' }}>
                    Completed
                  </p>
                </div>
                
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '1.5rem', 
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                  border: '1px solid #fcd34d'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
                    {Math.round(userHistory.statistics.average_score)}%
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e', fontWeight: '500' }}>
                    Average Score
                  </p>
                </div>
                
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '1.5rem', 
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
                  border: '1px solid #c4b5fd'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.5rem' }}>
                    {userHistory.statistics.total_bugs_found}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#581c87', fontWeight: '500' }}>
                    Bugs Found
                  </p>
                </div>
              </div>
            )}

            {/* Challenge History Table */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '2rem', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: '0 0 1.5rem 0' }}>
                📊 Challenge History
              </h2>
              
              {isLoadingHistory ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                  <p style={{ color: '#6b7280' }}>Loading your challenge history...</p>
                </div>
              ) : userHistory && userHistory.history.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Status</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Challenge</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Difficulty</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Best Score</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Attempts</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Bugs Found</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Last Attempted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userHistory.history.map((challenge) => (
                        <tr key={challenge.challenge_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>
                              {challenge.completed ? '✅' : challenge.attempts > 0 ? '🔄' : '⭕'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <div>
                              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: '#1f2937' }}>
                                {challenge.title}
                              </p>
                              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#6b7280' }}>
                                {challenge.language.toUpperCase()}
                              </p>
                            </div>
                          </td>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '1rem',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: 
                                challenge.difficulty === 'easy' ? '#dcfce7' :
                                challenge.difficulty === 'medium' ? '#fed7aa' :
                                '#fecaca',
                              color:
                                challenge.difficulty === 'easy' ? '#166534' :
                                challenge.difficulty === 'medium' ? '#92400e' :
                                '#991b1b'
                            }}>
                              {challenge.difficulty.toUpperCase()}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                            <span style={{ 
                              fontSize: '1.125rem', 
                              fontWeight: '600',
                              color: challenge.best_score >= 80 ? '#22c55e' : 
                                     challenge.best_score >= 50 ? '#f59e0b' : '#ef4444'
                            }}>
                              {Math.round(challenge.best_score)}
                            </span>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>/100</span>
                          </td>
                          <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                            <span style={{ 
                              padding: '0.25rem 0.5rem',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              color: '#374151'
                            }}>
                              {challenge.attempts}
                            </span>
                          </td>
                          <td style={{ padding: '1rem 0.75rem', textAlign: 'center' }}>
                            {challenge.best_submission ? (
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                <span style={{ color: '#22c55e', fontWeight: '500' }}>
                                  {challenge.best_submission.bugs_found}
                                </span>
                                <span style={{ color: '#6b7280' }}>/</span>
                                <span style={{ color: '#ef4444', fontWeight: '500' }}>
                                  {challenge.best_submission.bugs_missed}
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem 0.75rem' }}>
                            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                              {formatDate(challenge.last_attempted)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
                    No Challenges Yet
                  </h3>
                  <p style={{ margin: '0 0 1.5rem 0' }}>
                    Start taking challenges to build your history and track your progress!
                  </p>
                  <button
                    onClick={() => handleTabChange('dashboard')}
                    style={{
                      padding: '0.75rem 2rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.75rem',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}
                  >
                    🚀 Take Your First Challenge
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CandidateDashboard;