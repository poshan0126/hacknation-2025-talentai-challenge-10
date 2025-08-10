import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Challenge {
  id: string;
  title: string;
  description: string;
  buggy_code: string;
  language: string;
  difficulty: string;
  max_score: number;
  time_limit_minutes: number;
  tags: string[];
  expected_bugs?: any[];
}

interface SubmissionResult {
  id: string;
  score: number;
  accuracy_rate: number;
  bugs_found: number;
  bugs_missed: number;
  false_positives: number;
  status: 'pending' | 'evaluating' | 'completed';
  ai_feedback: string;
  evaluation_details?: {
    actual_bugs?: Array<{
      line_number: number;
      description: string;
    }>;
    [key: string]: any;
  };
}

const ChallengePlayPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [bugAnalysis, setBugAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Load challenge from navigation state
  useEffect(() => {
    if (location.state?.challenge) {
      setCurrentChallenge(location.state.challenge);
    } else {
      // If no challenge provided, redirect to home page
      navigate('/');
    }
  }, [location.state, navigate]);

  const submitAnalysis = async () => {
    if (!currentChallenge || !bugAnalysis.trim()) {
      setAlertMessage('Please analyze the code and describe the bugs you found!');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/debug/api/submissions/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challenge_id: currentChallenge.id,
          bug_analysis: bugAnalysis,
          expected_bugs: currentChallenge.expected_bugs,
          candidate_id: localStorage.getItem('candidateId') || undefined
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit analysis');
      }
      
      const submission = await response.json();
      
      if (!localStorage.getItem('candidateId')) {
        localStorage.setItem('candidateId', submission.candidate_id || 'anonymous');
      }
      
      setSubmissionResult(submission);
      pollSubmissionStatus(submission.id);
      
    } catch (error) {
      console.error('Error submitting analysis:', error);
      setAlertMessage('Failed to submit analysis. Please try again.');
      setIsLoading(false);
    }
  };

  const pollSubmissionStatus = async (submissionId: string) => {
    const maxAttempts = 30;
    let attempts = 0;
    
    const poll = async () => {
      try {
        const response = await fetch(`/debug/api/submissions/${submissionId}`);
        if (!response.ok) return;
        
        const result = await response.json();
        setSubmissionResult(result);
        
        if (result.status === 'completed' || attempts >= maxAttempts) {
          setIsLoading(false);
          return;
        }
        
        attempts++;
        setTimeout(poll, 1000);
        
      } catch (error) {
        console.error('Error polling submission status:', error);
        setIsLoading(false);
      }
    };
    
    poll();
  };

  const handleNewChallenge = async () => {
    setBugAnalysis('');
    setSubmissionResult(null);
    setIsLoadingChallenge(true);
    
    try {
      const response = await fetch('/debug/api/challenges/take-challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          difficulty: 'easy',
          language: 'python'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate challenge');
      }
      
      const challenge = await response.json();
      setCurrentChallenge(challenge);
      
    } catch (error) {
      console.error('Error generating challenge:', error);
      setAlertMessage('Failed to generate new challenge. Please try again.');
    } finally {
      setIsLoadingChallenge(false);
    }
  };

  if (!currentChallenge) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', backgroundColor: 'white', padding: '3rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            No Challenge Loaded
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            Please go back to start a new challenge.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header - Matching Landing Page */}
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
                  Debug Challenge in Progress - Find the bugs and submit your analysis
                </p>
              </div>
              
              {/* Challenge Status Indicator */}
              <div style={{ 
                padding: '0.75rem 1rem', 
                backgroundColor: '#f0f9ff', 
                borderRadius: '0.75rem', 
                border: '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1rem' }}>🐛</span>
                <div>
                  <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '600', color: '#0c4a6e' }}>
                    Challenge Active
                  </p>
                  <p style={{ margin: 0, fontSize: '0.625rem', color: '#0369a1' }}>
                    {currentChallenge?.difficulty} • {currentChallenge?.language}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem 2rem 2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Code Display Section */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '1rem', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            {/* Challenge Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '1.5rem',
              borderBottom: '3px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 'bold', 
                    color: 'white', 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    🐛 {currentChallenge.title}
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.9)', margin: '0.5rem 0 0 0', fontSize: '0.95rem' }}>
                    {currentChallenge.description}
                  </p>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.75rem',
                  alignItems: 'center'
                }}>
                  <span style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '2rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {currentChallenge.difficulty.toUpperCase()}
                  </span>
                  <span style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '2rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {currentChallenge.language.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Code Content */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1rem',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.25rem' }}>📝</span>
                <h3 style={{ 
                  fontWeight: '700', 
                  margin: 0,
                  fontSize: '1.125rem',
                  color: '#1f2937'
                }}>
                  Debug This Code
                </h3>
                <span style={{
                  marginLeft: 'auto',
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '1rem',
                  color: '#92400e',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  {currentChallenge.buggy_code.split('\n').length} lines
                </span>
              </div>
              
              <div style={{ 
                backgroundColor: '#1e293b',
                borderRadius: '0.75rem', 
                padding: '1.5rem',
                maxHeight: '500px',
                overflowY: 'auto',
                overflowX: 'auto',
                border: '2px solid #334155',
                position: 'relative'
              }}>
                {/* Line numbers and code */}
                <pre style={{ 
                  margin: 0,
                  fontFamily: '"Fira Code", "Monaco", "Consolas", "Liberation Mono", "Courier New", monospace',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: '#e2e8f0',
                  whiteSpace: 'pre',
                  wordBreak: 'normal',
                  wordWrap: 'normal',
                  display: 'flex'
                }}>
                  <div style={{
                    userSelect: 'none',
                    color: '#64748b',
                    paddingRight: '1rem',
                    borderRight: '1px solid #334155',
                    marginRight: '1rem',
                    textAlign: 'right',
                    minWidth: '2.5rem'
                  }}>
                    {currentChallenge.buggy_code.split('\n').map((_, index) => (
                      <div key={index}>{index + 1}</div>
                    ))}
                  </div>
                  <code style={{ flex: 1 }}>{currentChallenge.buggy_code}</code>
                </pre>
              </div>
            </div>
          </div>
          
          {/* Bug Analysis Section */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '1rem', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
            overflow: 'hidden',
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            {/* Analysis Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              padding: '1rem 1.5rem',
              borderBottom: '3px solid rgba(255,255,255,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem',
                fontWeight: '700', 
                margin: 0,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                🔍 Bug Analysis Console
              </h3>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {/* Instructions Card */}
              <div style={{ 
                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                padding: '1rem', 
                borderRadius: '0.75rem', 
                marginBottom: '1.5rem',
                border: '1px solid #7dd3fc'
              }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.25rem' }}>💡</span>
                  How to Submit Your Analysis:
                </p>
                <ul style={{ 
                  margin: '0.75rem 0 0 2rem', 
                  paddingLeft: '0', 
                  fontSize: '0.875rem',
                  color: '#0c4a6e',
                  lineHeight: '1.6'
                }}>
                  <li>📍 Carefully analyze the code and identify all bugs</li>
                  <li>📝 Describe each bug on a separate line with its location</li>
                  <li>🎯 Example: <code style={{ 
                    backgroundColor: 'rgba(255,255,255,0.7)', 
                    padding: '0.125rem 0.375rem',
                    borderRadius: '0.25rem',
                    fontFamily: 'monospace'
                  }}>Line 3: Off-by-one error in range function</code></li>
                  <li>✨ Be specific about the issue and how to fix it</li>
                </ul>
              </div>
              
              {/* Analysis Textarea */}
              <textarea
                value={bugAnalysis}
                onChange={(e) => setBugAnalysis(e.target.value)}
                disabled={isLoading || isLoadingChallenge}
                style={{
                  width: '100%',
                  height: '250px',
                  padding: '1rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  lineHeight: '1.6',
                  backgroundColor: isLoading ? '#f9fafb' : 'white',
                  fontFamily: '"Fira Code", monospace',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Describe the bugs you found in the code above...

Example:
Line 3: Off-by-one error - should use len(numbers) instead of len(numbers) - 1
Line 4: Using assignment (=) instead of addition (+=) 
Line 12: Using assignment (=) instead of comparison (==)"
              />
              
              {/* Action Buttons */}
              <div style={{ 
                marginTop: '1.5rem', 
                display: 'flex', 
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setBugAnalysis('')}
                  disabled={isLoading || isLoadingChallenge}
                  style={{
                    padding: '0.875rem 1.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && !isLoadingChallenge) {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }}
                >
                  <span style={{ fontSize: '1.125rem' }}>🗑️</span>
                  Clear Analysis
                </button>
                <button
                  onClick={submitAnalysis}
                  disabled={isLoading || !bugAnalysis.trim()}
                  style={{
                    padding: '0.875rem 2rem',
                    background: (isLoading || !bugAnalysis.trim()) 
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: (isLoading || !bugAnalysis.trim()) ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    boxShadow: (isLoading || !bugAnalysis.trim()) 
                      ? '0 2px 4px rgba(0,0,0,0.1)'
                      : '0 4px 15px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.95rem',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && bugAnalysis.trim()) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = (isLoading || !bugAnalysis.trim()) 
                      ? '0 2px 4px rgba(0,0,0,0.1)'
                      : '0 4px 15px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '1.125rem' }}>
                    {isLoading ? '⏳' : '🚀'}
                  </span>
                  {isLoading ? 'Evaluating...' : 'Submit Analysis'}
                </button>
              </div>
            
            </div>
          </div>
        </div>
      </main>

      {/* Results Modal Dialog */}
      {submissionResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '1.5rem',
              borderBottom: '3px solid rgba(255,255,255,0.1)'
            }}>
              <h3 style={{ 
                fontSize: '1.5rem',
                fontWeight: '700', 
                margin: 0,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <span style={{ fontSize: '2rem' }}>🤖</span>
                AI Evaluation Results
              </h3>
            </div>
            
            {/* Modal Body */}
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              padding: '2rem'
            }}>
              {submissionResult.status === 'completed' ? (
                <div>
                  {/* Code Display Section */}
                  <div style={{ 
                    marginBottom: '2rem',
                    background: '#1e293b',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    border: '2px solid #334155'
                  }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '0.75rem',
                      color: '#e2e8f0'
                    }}>
                      <span style={{ fontSize: '1.125rem', marginRight: '0.5rem' }}>📝</span>
                      <span style={{ 
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#94a3b8'
                      }}>
                        Challenge Code ({currentChallenge.language.toUpperCase()})
                      </span>
                    </div>
                    <div style={{ 
                      maxHeight: '200px',
                      overflowY: 'auto',
                      overflowX: 'auto'
                    }}>
                      <pre style={{ 
                        margin: 0,
                        fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                        fontSize: '0.85rem',
                        lineHeight: '1.5',
                        color: '#e2e8f0',
                        display: 'flex'
                      }}>
                        <div style={{
                          userSelect: 'none',
                          color: '#64748b',
                          paddingRight: '0.75rem',
                          borderRight: '1px solid #334155',
                          marginRight: '0.75rem',
                          textAlign: 'right',
                          minWidth: '2rem'
                        }}>
                          {currentChallenge.buggy_code.split('\n').map((_, index) => (
                            <div key={index} style={{ fontSize: '0.85rem' }}>{index + 1}</div>
                          ))}
                        </div>
                        <code style={{ flex: 1 }}>{currentChallenge.buggy_code}</code>
                      </pre>
                    </div>
                  </div>
                  {/* Score Cards */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: '1rem', 
                    marginBottom: '2rem' 
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      padding: '1.25rem',
                      borderRadius: '0.75rem',
                      textAlign: 'center',
                      border: '2px solid #38bdf8'
                    }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
                      <div style={{ fontSize: '0.875rem', color: '#0369a1', marginBottom: '0.25rem', fontWeight: '600' }}>SCORE</div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0c4a6e' }}>
                        {submissionResult.score.toFixed(0)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#0369a1' }}>/100</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      padding: '1.25rem',
                      borderRadius: '0.75rem',
                      textAlign: 'center',
                      border: '2px solid #4ade80'
                    }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📊</div>
                      <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.25rem', fontWeight: '600' }}>ACCURACY</div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#14532d' }}>
                        {submissionResult.accuracy_rate.toFixed(0)}%
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      padding: '1.25rem',
                      borderRadius: '0.75rem',
                      textAlign: 'center',
                      border: '2px solid #4ade80'
                    }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
                      <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.25rem', fontWeight: '600' }}>BUGS FOUND</div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>
                        {submissionResult.bugs_found}
                      </div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                      padding: '1.25rem',
                      borderRadius: '0.75rem',
                      textAlign: 'center',
                      border: '2px solid #f87171'
                    }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>❌</div>
                      <div style={{ fontSize: '0.875rem', color: '#991b1b', marginBottom: '0.25rem', fontWeight: '600' }}>BUGS MISSED</div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
                        {submissionResult.bugs_missed}
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Feedback */}
                  <div style={{ 
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    padding: '1.5rem', 
                    borderRadius: '0.75rem', 
                    marginBottom: '1.5rem',
                    border: '2px solid #e2e8f0'
                  }}>
                    <div style={{ 
                      fontSize: '1.125rem', 
                      fontWeight: '700', 
                      color: '#1e293b',
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>💭</span>
                      AI Feedback
                    </div>
                    <div style={{ 
                      fontSize: '1rem', 
                      color: '#475569',
                      lineHeight: '1.7'
                    }}>
                      {submissionResult.ai_feedback}
                    </div>
                  </div>
                  
                  {/* Actual Bugs */}
                  {submissionResult.evaluation_details?.actual_bugs && submissionResult.evaluation_details.actual_bugs.length > 0 && (
                    <div style={{ 
                      background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                      padding: '1.5rem', 
                      borderRadius: '0.75rem', 
                      marginBottom: '2rem',
                      border: '2px solid #fbbf24'
                    }}>
                      <div style={{ 
                        fontSize: '1.125rem', 
                        fontWeight: '700', 
                        color: '#92400e',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{ fontSize: '1.5rem' }}>📍</span>
                        Actual Bugs in the Code
                      </div>
                      {submissionResult.evaluation_details.actual_bugs.map((bug: any, index: number) => (
                        <div key={index} style={{ 
                          marginTop: index > 0 ? '0.75rem' : 0,
                          fontSize: '1rem',
                          color: '#78350f',
                          paddingLeft: '2rem',
                          position: 'relative',
                          lineHeight: '1.6'
                        }}>
                          <span style={{ 
                            position: 'absolute', 
                            left: '0.5rem',
                            top: '0.125rem',
                            fontSize: '1.125rem'
                          }}>•</span>
                          <strong>Line {bug.line_number}:</strong> {bug.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>⏳</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
                    AI is evaluating your submission...
                  </div>
                  <div style={{ fontSize: '1rem', color: '#64748b' }}>
                    This may take a few seconds
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.375rem', marginTop: '2rem' }}>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: '#667eea',
                      animation: 'pulse 1.4s infinite'
                    }}></div>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: '#667eea',
                      animation: 'pulse 1.4s infinite 0.2s'
                    }}></div>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      borderRadius: '50%',
                      backgroundColor: '#667eea',
                      animation: 'pulse 1.4s infinite 0.4s'
                    }}></div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            {submissionResult.status === 'completed' && (
              <div style={{ 
                padding: '1.5rem',
                borderTop: '2px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                background: '#f9fafb'
              }}>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    padding: '0.875rem 2rem',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🏁</span>
                  End Challenge
                </button>
                <button
                  onClick={handleNewChallenge}
                  disabled={isLoading || isLoadingChallenge}
                  style={{
                    padding: '0.875rem 2rem',
                    background: (isLoading || isLoadingChallenge) 
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                      : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.75rem',
                    cursor: (isLoading || isLoadingChallenge) ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600',
                    boxShadow: (isLoading || isLoadingChallenge)
                      ? '0 2px 4px rgba(0,0,0,0.1)'
                      : '0 4px 15px rgba(34, 197, 94, 0.3)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transform: 'scale(1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && !isLoadingChallenge) {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = (isLoading || isLoadingChallenge)
                      ? '0 2px 4px rgba(0,0,0,0.1)'
                      : '0 4px 15px rgba(34, 197, 94, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>
                    {isLoadingChallenge ? '🔄' : '🎯'}
                  </span>
                  {isLoadingChallenge ? 'Generating...' : 'Try Another Challenge'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay for New Challenge */}
      {isLoadingChallenge && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
              Generating New Challenge
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              AI is creating a unique debugging challenge for you...
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
              <div style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                animation: 'pulse 1.4s infinite'
              }}></div>
              <div style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                animation: 'pulse 1.4s infinite 0.2s'
              }}></div>
              <div style={{
                width: '0.75rem',
                height: '0.75rem',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                animation: 'pulse 1.4s infinite 0.4s'
              }}></div>
            </div>
          </div>
        </div>
      )}

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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default ChallengePlayPage;