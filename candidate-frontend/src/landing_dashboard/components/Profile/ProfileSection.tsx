import React, { useState } from 'react';

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

const ProfileSection: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData>({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Full Stack Developer',
    summary: 'Experienced software developer with 5+ years in web development, specializing in React, Node.js, and cloud technologies. Passionate about creating efficient, scalable solutions and debugging complex systems.',
    experience: '3-5',
    skills: ['Python', 'JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker'],
    education: 'Bachelor of Science in Computer Science',
    languages: ['English (Native)', 'Spanish (Conversational)'],
    certifications: ['AWS Certified Developer', 'Google Cloud Professional']
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      setResumeFile(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
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
              725
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
              8
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#14532d', fontWeight: '500' }}>
              Challenges Won
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
              87%
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e', fontWeight: '500' }}>
              Accuracy Rate
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
              #9
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#581c87', fontWeight: '500' }}>
              Global Rank
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
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#f8fafc', 
          borderRadius: '0.75rem',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', margin: '0 0 0.5rem 0' }}>
            Senior Software Developer
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#667eea', fontWeight: '500', margin: '0 0 0.75rem 0' }}>
            Tech Solutions Inc. • 2021 - Present
          </p>
          <ul style={{ 
            fontSize: '0.9rem', 
            color: '#374151', 
            lineHeight: '1.6', 
            paddingLeft: '1.25rem',
            margin: 0
          }}>
            <li>Led development of scalable web applications serving 100k+ users</li>
            <li>Implemented automated debugging tools reducing issue resolution time by 40%</li>
            <li>Mentored junior developers and conducted code reviews</li>
          </ul>
        </div>
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
            {isEditing ? (
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
            ) : (
              <>
                <p style={{ margin: '0 0 0.25rem 0', fontWeight: '600' }}>{profileData.education}</p>
                <p style={{ margin: 0, color: '#6b7280' }}>University of California • 2016-2020</p>
              </>
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
            {profileData.languages.map((lang, index) => (
              <p key={index} style={{ margin: '0.25rem 0' }}>• {lang}</p>
            ))}
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
      </section>
    </div>
  );
};

export default ProfileSection;