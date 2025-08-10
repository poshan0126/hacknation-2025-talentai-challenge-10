import React, { useState, useEffect } from 'react';
import { useUser } from '../../../contexts/UserContext';
import UserDropdown from '../../../components/UserSelector/UserDropdown';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
  experience: string;
  skills: string[];
  education: string;
  languages: string[];
  certifications: string[];
  resume?: File;
}

interface UserStatistics {
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
}

const ProfileSection: React.FC = () => {
  const { currentUser } = useUser();
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    summary: '',
    experience: '',
    skills: [],
    education: '',
    languages: [],
    certifications: []
  });
  const [userStats, setUserStats] = useState<UserStatistics | null>(null);
  const [leaderboardRank, setLeaderboardRank] = useState<number | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);

  useEffect(() => {
    if (currentUser) {
      // Set initial profile data from current user
      setProfileData(prev => ({
        ...prev,
        name: currentUser.display_name,
        email: currentUser.email
      }));
      
      fetchUserProfile();
      fetchLeaderboard();
      fetchResumeData();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`/debug/api/users/${currentUser.user_id}/profile`);
      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({
          ...prev,
          name: data.display_name,
          email: data.email || prev.email
        }));
        setUserStats(data.statistics);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch('/debug/api/users/leaderboard');
      if (response.ok) {
        const data = await response.json();
        const userEntry = data.find((entry: any) => entry.user_id === currentUser.user_id);
        if (userEntry) {
          setLeaderboardRank(userEntry.rank);
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.pdf') || file.name.endsWith('.md') || file.name.endsWith('.txt') || 
        file.type === 'application/pdf' || file.type === 'text/plain' || file.type === 'text/markdown')) {
      setResumeFile(file);
      await uploadResume(file);
    } else {
      alert('Please upload a PDF (.pdf), markdown (.md) or text (.txt) file');
    }
  };

  const uploadResume = async (file: File) => {
    if (!currentUser) return;
    
    setIsUploadingResume(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`/resume/api/user-resume/upload/${currentUser.user_id}`, {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update profile data with parsed resume info
          setProfileData(prev => ({
            ...prev,
            phone: result.data.phone || prev.phone,
            location: result.data.location || prev.location,
            title: result.data.title || prev.title,
            summary: result.data.summary || prev.summary,
            skills: result.data.skills ? 
              Object.values(result.data.skills).flat() as string[] : 
              prev.skills
          }));
          setResumeData(result.data);
          
          // Fetch updated profile data to get education and experience
          fetchResumeData();
          alert('Resume uploaded and parsed successfully!');
        }
      } else {
        alert('Failed to upload resume');
      }
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Error uploading resume');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const fetchResumeData = async () => {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/resume/api/user-resume/profile/${currentUser.user_id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.has_resume) {
          setResumeData(result.data);
          // Update profile with resume data
          setProfileData(prev => ({
            ...prev,
            phone: result.data.phone || prev.phone,
            location: result.data.location || prev.location,
            title: result.data.professional_title || prev.title,
            summary: result.data.summary || prev.summary,
            skills: result.data.skills ? 
              Object.values(result.data.skills).flat() as string[] : 
              prev.skills,
            education: result.data.education && result.data.education.length > 0 && result.data.education[0].institution ?
              `${result.data.education[0].degree} in ${result.data.education[0].field_of_study}` :
              prev.education
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching resume data:', error);
    }
  };


  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '1rem', 
      padding: '3rem', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      marginBottom: '2rem',
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      {/* Header with Name and Contact */}
      <div style={{ borderBottom: '3px solid #667eea', paddingBottom: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.025em'
            }}>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  style={{
                    fontSize: '3rem',
                    fontWeight: 'bold',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    width: '100%'
                  }}
                />
              ) : (
                profileData.name
              )}
            </h1>
            
            <h2 style={{ 
              fontSize: '1.5rem', 
              color: '#667eea', 
              margin: '0 0 1rem 0',
              fontWeight: '500'
            }}>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.title}
                  onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                  style={{
                    fontSize: '1.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    padding: '0.25rem 0.5rem',
                    width: '100%'
                  }}
                />
              ) : (
                profileData.title
              )}
            </h2>
            
            {/* Contact Info */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '0.75rem', 
              fontSize: '0.9rem',
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>📧</span>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.9rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <span style={{ color: '#667eea' }}>{profileData.email}</span>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>📞</span>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.9rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <span>{profileData.phone}</span>
                )}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1rem' }}>📍</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.9rem',
                      width: '100%'
                    }}
                  />
                ) : (
                  <span>{profileData.location}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* User Selector and Edit Profile Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '2rem'
        }}>
          <UserDropdown />
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              padding: '0.75rem 1.5rem',
              background: isEditing ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s'
            }}
          >
            {isEditing ? '💾 Save Profile' : '✏️ Edit Profile'}
          </button>
        </div>
      </div>

      {/* Resume Upload Section */}
      <div style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem', 
        backgroundColor: '#f8fafc', 
        borderRadius: '0.75rem',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ 
          fontSize: '1.1rem', 
          fontWeight: '600', 
          color: '#1f2937', 
          marginBottom: '0.5rem' 
        }}>
          📄 Resume Upload
        </h3>
        <p style={{ 
          fontSize: '0.75rem', 
          color: '#6b7280', 
          marginBottom: '1rem' 
        }}>
          Supported formats: PDF (.pdf), Markdown (.md), or Text (.txt)
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input
            type="file"
            accept=".pdf,.md,.txt,application/pdf,text/plain,text/markdown"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            id="resume-upload"
            disabled={isUploadingResume}
          />
          <label
            htmlFor="resume-upload"
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '0.5rem',
              cursor: isUploadingResume ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              opacity: isUploadingResume ? 0.7 : 1
            }}
          >
            {isUploadingResume ? 'Uploading...' : '📤 Upload Resume (PDF, MD, or TXT)'}
          </label>
          {resumeData && (
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              ✅ Resume uploaded: {resumeData.resume_file || 'Successfully parsed'}
            </span>
          )}
        </div>
        {resumeData && resumeData.parsed_at && (
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#9ca3af', 
            marginTop: '0.5rem' 
          }}>
            Last updated: {new Date(resumeData.parsed_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* Points & Stats */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '1.5rem 1rem', 
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', 
            borderRadius: '0.75rem',
            border: '1px solid #bae6fd'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '0.5rem' }}>
              {userStats ? Math.round(userStats.total_score) : '0'}
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#0c4a6e', fontWeight: '500' }}>
              Total Points
            </p>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            padding: '1.5rem 1rem', 
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
            borderRadius: '0.75rem',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '0.5rem' }}>
              {userStats ? userStats.challenges_completed : '0'}
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#14532d', fontWeight: '500' }}>
              Challenges Completed
            </p>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            padding: '1.5rem 1rem', 
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
            borderRadius: '0.75rem',
            border: '1px solid #fcd34d'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '0.5rem' }}>
              {userStats ? `${Math.round(userStats.average_score)}%` : '0%'}
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e', fontWeight: '500' }}>
              Average Score
            </p>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            padding: '1.5rem 1rem', 
            background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', 
            borderRadius: '0.75rem',
            border: '1px solid #c4b5fd'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '0.5rem' }}>
              {leaderboardRank ? `#${leaderboardRank}` : 'N/A'}
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#581c87', fontWeight: '500' }}>
              Global Rank
            </p>
          </div>
        </div>
        
        {/* Additional Stats Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '1.5rem'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem' }}>
              {userStats ? userStats.challenges_attempted : '0'}
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
              Challenges Attempted
            </p>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem' }}>
              {userStats ? userStats.total_bugs_found : '0'}
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
              Bugs Found
            </p>
          </div>
          
          <div style={{ 
            textAlign: 'center', 
            padding: '1rem', 
            backgroundColor: '#f9fafb', 
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#374151', marginBottom: '0.25rem' }}>
              {userStats ? Math.round(userStats.highest_score) : '0'}
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
              Best Score
            </p>
          </div>
        </div>
      </section>

      {/* Professional Summary */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '1rem',
          borderBottom: '2px solid #f3f4f6',
          paddingBottom: '0.5rem'
        }}>
          Professional Summary
        </h3>
        {isEditing ? (
          <textarea
            value={profileData.summary}
            onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
            style={{
              width: '100%',
              height: '100px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              resize: 'vertical'
            }}
          />
        ) : (
          <p style={{ 
            fontSize: '0.95rem', 
            lineHeight: '1.6', 
            color: '#374151', 
            margin: 0,
            textAlign: 'justify'
          }}>
            {profileData.summary}
          </p>
        )}
      </section>

      {/* Skills */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '1rem',
          borderBottom: '2px solid #f3f4f6',
          paddingBottom: '0.5rem'
        }}>
          Technical Skills
        </h3>
        {profileData.skills.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {profileData.skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  color: '#1e40af',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: '1px solid #93c5fd'
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            No skills data available. Upload your resume to populate this section.
          </p>
        )}
      </section>

      {/* Experience */}
      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '1rem',
          borderBottom: '2px solid #f3f4f6',
          paddingBottom: '0.5rem'
        }}>
          Experience
        </h3>
        {resumeData && resumeData.experience && resumeData.experience.length > 0 ? (
          resumeData.experience.map((exp: any, index: number) => (
            <div key={index} style={{ 
              padding: '1.5rem', 
              backgroundColor: '#f8fafc', 
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              marginBottom: index < resumeData.experience.length - 1 ? '1rem' : 0
            }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
                {exp.title}
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#667eea', fontWeight: '500', margin: '0 0 0.75rem 0' }}>
                {exp.company} • {exp.start} - {exp.end}
                {exp.location && ` • ${exp.location}`}
              </p>
              {exp.highlights && exp.highlights.length > 0 && (
                <ul style={{ 
                  fontSize: '0.9rem', 
                  color: '#374151', 
                  lineHeight: '1.6', 
                  paddingLeft: '1.25rem',
                  margin: 0
                }}>
                  {exp.highlights.map((highlight: string, i: number) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              )}
            </div>
          ))
        ) : (
          <div style={{ 
            padding: '1.5rem', 
            backgroundColor: '#f8fafc', 
            borderRadius: '0.75rem',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              No experience data available. Upload your resume to populate this section.
            </p>
          </div>
        )}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Education */}
        <section>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '1rem',
            borderBottom: '2px solid #f3f4f6',
            paddingBottom: '0.5rem'
          }}>
            Education
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#374151' }}>
            {resumeData && resumeData.education && resumeData.education.length > 0 ? (
              resumeData.education.map((edu: any, index: number) => (
                <div key={index} style={{ marginBottom: index < resumeData.education.length - 1 ? '1rem' : 0 }}>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600' }}>
                    {edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}
                  </p>
                  <p style={{ margin: 0, color: '#6b7280' }}>
                    {edu.institution} {edu.year && `• ${edu.year}`}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                </div>
              ))
            ) : isEditing ? (
              <input
                type="text"
                value={profileData.education}
                onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.9rem'
                }}
              />
            ) : profileData.education ? (
              <p style={{ margin: '0', fontWeight: '600' }}>{profileData.education}</p>
            ) : (
              <p style={{ margin: 0, color: '#6b7280' }}>No education data available</p>
            )}
          </div>
        </section>

        {/* Languages */}
        <section>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '1rem',
            borderBottom: '2px solid #f3f4f6',
            paddingBottom: '0.5rem'
          }}>
            Languages
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#374151' }}>
            {profileData.languages.length > 0 ? (
              profileData.languages.map((lang, index) => (
                <p key={index} style={{ margin: '0.25rem 0' }}>• {lang}</p>
              ))
            ) : (
              <p style={{ color: '#6b7280' }}>No language data available</p>
            )}
          </div>
        </section>
      </div>

      {/* Certifications */}
      <section style={{ marginTop: '2rem' }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '1rem',
          borderBottom: '2px solid #f3f4f6',
          paddingBottom: '0.5rem'
        }}>
          Certifications
        </h3>
        {profileData.certifications.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {profileData.certifications.map((cert, index) => (
              <span
                key={index}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  border: '1px solid #fcd34d'
                }}
              >
                🏆 {cert}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            No certifications data available
          </p>
        )}
      </section>
    </div>
  );
};

export default ProfileSection;