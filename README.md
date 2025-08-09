# TalentAI MVP: AI-Powered Talent Matching Platform

## 🎯 Core Value Proposition
Revolutionary AI talent marketplace that matches candidates through **debugging challenges** rather than traditional interviews, with **bias-free evaluation** and **instant job-candidate recommendations**.

## 🚀 MVP Features (15-Hour Build)

### End-to-End Flow
1. **Blind Resume Processing** → Extract skills without revealing PII
2. **Interactive Skill Graph** → Visual representation of candidate capabilities  
3. **AI Bug Hunt Challenge** → Find and comment on bugs in ML code
4. **Anonymous Leaderboard** → Performance-based ranking without bias
5. **Instant Job Matching** → AI recommends top candidates when jobs are posted

### Core Features
- ✅ **Blind Resume Parsing** - PII hidden until shortlisted
- ✅ **Dynamic Skill Graph Visualization** - Force-directed skill networks
- ✅ **AI Bug Hunt Arena** - Comment on bugs, AI evaluates accuracy
- ✅ **Anonymous Performance Leaderboard** - Bias-free ranking
- ✅ **Semantic Job-Candidate Matching** - AI-powered recommendations
- ✅ **Separate Platforms** - Dedicated candidate & recruiter applications
- ✅ **Real-time Job Posting Integration** - Instant candidate suggestions

## 📁 Project Structure

```
TALENTAI-CHALLENGE-10/
├── README.md
├── docker-compose.yml
├── .env.example
│
├── candidate-backend/                 # Candidate-focused Backend
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                        # FastAPI app entry point
│   ├── config/
│   │   ├── __init__.py
│   │   ├── database.py               # PostgreSQL config
│   │   └── settings.py               # Environment variables
│   ├── models/
│   │   ├── __init__.py
│   │   ├── candidate.py              # Candidate profile model
│   │   ├── skill.py                  # Skill assessment model
│   │   ├── challenge.py              # Challenge attempt model
│   │   └── achievement.py            # Performance tracking model
│   ├── services/
│   │   ├── __init__.py
│   │   ├── resume_parser.py          # LangChain-based skill extraction
│   │   ├── skill_graph.py            # Skill relationship mapping
│   │   ├── challenge_validator.py    # Local LLM analysis of bug comments
│   │   ├── performance_tracker.py    # Challenge scoring & analytics
│   │   └── profile_builder.py        # Anonymous profile creation
│   ├── api/
│   │   ├── __init__.py
│   │   ├── profile.py                # Profile management endpoints
│   │   ├── challenges.py             # Bug hunt system endpoints
│   │   ├── skills.py                 # Skill assessment endpoints
│   │   ├── leaderboard.py            # Performance ranking endpoints
│   │   └── recommendations.py        # Job suggestion endpoints
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── llm_client.py             # Ollama/LM Studio integration
│   │   ├── vector_db.py              # Chroma for skill embeddings
│   │   └── auth.py                   # Local authentication
│   └── data/
│       ├── sample_resumes/           # Sample candidate data
│       └── challenge_templates/      # Pre-built debugging scenarios
│
├── recruiter-backend/                 # Recruiter-focused Backend
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py                        # FastAPI app entry point
│   ├── config/
│   │   ├── __init__.py
│   │   ├── database.py               # PostgreSQL config
│   │   └── settings.py               # Environment variables
│   ├── models/
│   │   ├── __init__.py
│   │   ├── company.py                # Company profile model
│   │   ├── job_posting.py            # Job requirement model
│   │   ├── candidate_match.py        # Matching score model
│   │   └── hiring_analytics.py       # Performance metrics model
│   ├── services/
│   │   ├── __init__.py
│   │   ├── job_parser.py             # Extract requirements from job posts
│   │   ├── matching_engine.py        # LangGraph-powered job-candidate matching
│   │   ├── recommendation_ai.py      # Local LLM candidate suggestions
│   │   ├── bias_mitigation.py        # Fairness & bias detection
│   │   └── analytics_engine.py       # Hiring pipeline insights
│   ├── api/
│   │   ├── __init__.py
│   │   ├── jobs.py                   # Job posting endpoints
│   │   ├── candidates.py             # Candidate search & review endpoints
│   │   ├── matches.py                # Matching & recommendation endpoints
│   │   ├── analytics.py              # Hiring metrics endpoints
│   │   └── shortlist.py              # Candidate evaluation endpoints
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── llm_client.py             # Ollama/LM Studio integration
│   │   ├── vector_db.py              # Chroma for job-candidate matching
│   │   └── auth.py                   # Local authentication
│   └── data/
│       ├── job_templates/            # Sample job descriptions
│       └── company_profiles/         # Sample company data
│
├── candidate-frontend/                # Candidate Platform (React/Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── public/
│   │   └── assets/                   # Candidate-focused assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── CandidateHeader.tsx
│   │   │   │   ├── CandidateSidebar.tsx
│   │   │   │   └── CandidateLayout.tsx
│   │   │   ├── profile/
│   │   │   │   ├── ResumeUpload.tsx
│   │   │   │   ├── SkillGraph.tsx        # D3.js skill visualization
│   │   │   │   ├── ProfileBuilder.tsx
│   │   │   │   └── SkillGapAnalysis.tsx
│   │   │   ├── challenges/
│   │   │   │   ├── BugHuntArena.tsx      # Code display + comment interface
│   │   │   │   ├── ChallengeList.tsx
│   │   │   │   ├── PerformanceStats.tsx
│   │   │   │   └── Leaderboard.tsx
│   │   │   ├── jobs/
│   │   │   │   ├── JobRecommendations.tsx
│   │   │   │   ├── JobSearch.tsx
│   │   │   │   └── ApplicationTracker.tsx
│   │   │   └── shared/
│   │   │       ├── LoadingSpinner.tsx
│   │   │       └── NotificationCenter.tsx
│   │   ├── pages/
│   │   │   ├── index.tsx                 # Candidate landing page
│   │   │   ├── dashboard.tsx             # Main candidate dashboard
│   │   │   ├── profile.tsx               # Profile management
│   │   │   ├── challenges.tsx            # Challenge arena
│   │   │   ├── jobs.tsx                  # Job recommendations
│   │   │   └── performance.tsx           # Analytics & insights
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useProfile.ts
│   │   │   ├── useChallenges.ts
│   │   │   └── useWebSocket.ts
│   │   ├── services/
│   │   │   ├── candidateApi.ts           # Candidate backend integration
│   │   │   └── websocket.ts              # Real-time updates
│   │   └── utils/
│   │       ├── constants.ts
│   │       └── candidateHelpers.ts
│
├── recruiter-frontend/                # Recruiter Platform (React/Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── public/
│   │   └── assets/                   # Recruiter-focused assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── RecruiterHeader.tsx
│   │   │   │   ├── RecruiterSidebar.tsx
│   │   │   │   └── RecruiterLayout.tsx
│   │   │   ├── jobs/
│   │   │   │   ├── JobPosting.tsx
│   │   │   │   ├── JobManagement.tsx
│   │   │   │   └── RequirementBuilder.tsx
│   │   │   ├── candidates/
│   │   │   │   ├── CandidateSearch.tsx
│   │   │   │   ├── CandidateProfile.tsx
│   │   │   │   ├── MatchRecommendations.tsx
│   │   │   │   └── ShortlistManager.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── HiringMetrics.tsx
│   │   │   │   ├── BiasReports.tsx
│   │   │   │   ├── PipelineAnalytics.tsx
│   │   │   │   └── PerformanceDashboard.tsx
│   │   │   └── shared/
│   │   │       ├── FilterPanel.tsx
│   │   │       └── ComparisonTable.tsx
│   │   ├── pages/
│   │   │   ├── index.tsx                 # Recruiter landing page
│   │   │   ├── dashboard.tsx             # Main recruiter dashboard
│   │   │   ├── jobs.tsx                  # Job posting & management
│   │   │   ├── candidates.tsx            # Candidate search & review
│   │   │   ├── matches.tsx               # AI recommendations
│   │   │   ├── analytics.tsx             # Hiring insights
│   │   │   └── shortlist.tsx             # Candidate evaluation
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useJobs.ts
│   │   │   ├── useCandidates.ts
│   │   │   └── useAnalytics.ts
│   │   ├── services/
│   │   │   ├── recruiterApi.ts           # Recruiter backend integration
│   │   │   └── realtime.ts               # Live updates & notifications
│   │   └── utils/
│   │       ├── constants.ts
│   │       └── recruiterHelpers.ts
│
├── shared/                            # Shared Components & Services
│   ├── types/
│   │   ├── candidate.ts              # Candidate data types
│   │   ├── job.ts                    # Job posting types
│   │   ├── challenge.ts              # Challenge data types
│   │   └── match.ts                  # Matching algorithm types
│   ├── utils/
│   │   ├── api.ts                    # Common API utilities
│   │   ├── validation.ts             # Data validation schemas
│   │   └── formatting.ts             # Common formatting functions
│   └── constants/
│       ├── skills.ts                 # Skill taxonomy
│       ├── challenges.ts             # Challenge categories
│       └── config.ts                 # Shared configuration
│
├── challenges/                        # Pre-built Debugging Challenges
│   ├── ml_bugs/                      # ML/AI specific bug scenarios
│   │   ├── tensor_shape_bug.py
│   │   ├── memory_leak_model.py
│   │   ├── data_preprocessing_bug.py
│   │   ├── convergence_issue.py
│   │   └── deployment_bugs.py
│   ├── templates/
│   │   ├── challenge_template.json   # Challenge structure format
│   │   └── solution_template.json    # Expected solution format
│   └── validators/
│       ├── __init__.py
│       ├── bug_detector.py           # AI analysis of candidate comments
│       └── solution_scorer.py        # LLM-based solution evaluation
│
└── scripts/                          # Development & Deployment
    ├── setup.sh                      # Local development setup
    ├── deploy.sh                     # Production deployment
    ├── seed_candidate_data.py        # Populate candidate sample data
    ├── seed_recruiter_data.py        # Populate recruiter sample data
    └── run_tests.sh                  # Automated testing
```

## 🛠️ Technology Stack (Local & Open Source)

### AI & Orchestration
- **LangChain** - Agent orchestration and prompt management
- **LangGraph** - Multi-agent workflow state management
- **Ollama / LM Studio** - Local LLM hosting (LLaMA, Mistral)
- **Chroma / Weaviate** - Local vector database for embeddings

### Backend Services
- **FastAPI** - High-performance Python API framework (both backends)
- **Pydantic** - Data validation and type safety
- **Uvicorn** - ASGI server for local development
- **SQLite** - Lightweight local database
- **JSON/Parquet Files** - Quick data prototyping

### Frontend Applications  
- **React** - Component-based UI (both frontends)
- **Vite** - Lightweight local dev server & bundler
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **D3.js** - Interactive skill graph visualization

### Development & Storage
- **Poetry/pip** - Python dependency management
- **Git + GitHub** - Version control and collaboration
- **Local File System** - Document and media storage
- **Docker** - Optional local containerization

## 🚀 Quick Start

### Prerequisites
```bash
- Node.js 18+
- Python 3.11+
- Docker (optional)
- Ollama or LM Studio installed locally
```

### Installation
```bash
# Clone repository
git clone https://github.com/your-team/talentai-mvp
cd talentai-mvp

# Setup local LLM (choose one)
# Option 1: Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull llama2

# Option 2: LM Studio
# Download and install from https://lmstudio.ai

# Install dependencies
cd candidate-frontend && npm install
cd ../recruiter-frontend && npm install
cd ../candidate-backend && pip install -r requirements.txt
cd ../recruiter-backend && pip install -r requirements.txt

# Initialize local databases
python scripts/setup_local_db.py

# Start local services
# Terminal 1: Candidate Frontend
cd candidate-frontend && npm run dev  # http://localhost:3000

# Terminal 2: Recruiter Frontend  
cd recruiter-frontend && npm run dev  # http://localhost:3001

# Terminal 3: Candidate Backend
cd candidate-backend && uvicorn main:app --reload --port 8000

# Terminal 4: Recruiter Backend
cd recruiter-backend && uvicorn main:app --reload --port 8001
```

## 📊 Core Workflows

### 1. Candidate Journey (Platform: localhost:3000)
```
Resume Upload → Skill Extraction → Anonymous Profile Creation 
→ Skill Graph Visualization → Bug Hunt Challenge 
→ AI Analysis of Comments → Performance Scoring → Job Recommendations
```

### 2. Recruiter Journey (Platform: localhost:3001)
```
Job Posting → AI Analysis → Instant Candidate Recommendations
→ Anonymous Profile Review → Challenge Performance Analysis
→ Shortlist Decision → PII Reveal → Interview Scheduling
```

### 3. Bug Hunt Challenge Flow
```
Display Buggy Code → Candidate Adds Comments Identifying Issues
→ AI Analyzes Comment Accuracy → Scores Bug Detection Skills
→ Updates Anonymous Leaderboard → Provides Learning Feedback
```

### 4. Bias Mitigation Flow
```
Resume Processing → PII Removal → Skill-Only Evaluation
→ Anonymous Scoring → Performance-Based Ranking
→ Identity Reveal Only After Shortlisting
```

## 🎯 Key Features Implementation

### Candidate Platform Features
- **Profile Builder**: Resume upload, skill extraction, anonymous profile creation
- **Skill Graph**: Interactive D3.js visualization of technical capabilities
- **Challenge Arena**: Bug hunt interface with code display and comment system
- **Performance Dashboard**: Personal analytics, leaderboard ranking, skill gaps
- **Job Recommendations**: AI-powered job matching based on skills and performance

### Recruiter Platform Features
- **Job Management**: Create, edit, and manage job postings with AI requirement analysis
- **Candidate Discovery**: Search and filter anonymous candidates by skills and performance
- **Match Recommendations**: AI suggestions for best candidates per job posting
- **Analytics Dashboard**: Hiring pipeline metrics, bias reports, performance insights
- **Shortlist Management**: Candidate evaluation, comparison, and PII reveal controls

### Shared AI Services
- **LangChain Resume Intelligence**: Local LLM-based skill extraction and profile enrichment
- **Challenge Validation**: Local AI analysis of bug identification accuracy
- **LangGraph Matching**: Multi-agent job-candidate compatibility scoring
- **Bias Detection**: Local fairness monitoring and demographic bias mitigation

## 📈 Success Metrics

### Technical KPIs
- **Resume Processing**: <5 seconds per resume
- **Challenge Completion**: <15 minutes average
- **Matching Accuracy**: >90% recruiter satisfaction
- **System Scalability**: Handle 1000+ concurrent users per platform

### Business KPIs  
- **Bias Reduction**: Measurable improvement in diversity metrics
- **Time-to-Hire**: 60%+ reduction from industry average
- **Match Quality**: 85%+ interview-to-offer conversion
- **User Engagement**: 70%+ challenge completion rate

## 🔐 Security & Privacy

### Data Protection
- **Separate Databases**: Candidate and recruiter data isolation
- **PII Encryption**: All personal data encrypted at rest
- **Anonymous Processing**: Skills-only evaluation until shortlisting
- **GDPR Compliance**: Right to deletion and data portability

### Bias Mitigation
- **Blind Evaluation**: Identity hidden during initial assessment
- **Fairness Monitoring**: Track outcomes across demographic groups
- **Algorithm Auditing**: Regular bias detection and correction
- **Transparent Scoring**: Explainable AI recommendations

## 🎨 Demo Strategy

### Dual-Platform Demo (15 minutes)
1. **Candidate Platform**: Upload resume → skill graph → bug hunt challenge
2. **Recruiter Platform**: Post job → view instant recommendations → analyze performance
3. **Cross-Platform Flow**: Show how candidate performance updates recruiter recommendations
4. **Bias Dashboard**: Demonstrate fairness metrics on both platforms
5. **Real-Time Updates**: Live synchronization between platforms

### Key Selling Points
- **Debugging Focus**: "Everyone can code, few can debug effectively"
- **Bias Elimination**: PII hidden until performance-based shortlisting
- **Instant Matching**: AI recommendations the moment jobs are posted
- **Separate Experiences**: Optimized interfaces for different user types

## 🔮 Development Team Assignment

### Person 1: Candidate Platform (Backend + Frontend)
- **candidate-backend**: Profile, challenges, performance APIs
- **candidate-frontend**: Resume upload, skill graph, bug hunt interface
- **Focus**: User experience optimization and challenge system

### Person 2: Recruiter Platform (Backend + Frontend)  
- **recruiter-backend**: Jobs, matching, analytics APIs
- **recruiter-frontend**: Job posting, candidate search, analytics dashboard
- **Focus**: Business intelligence and matching algorithms

### Person 3: AI Services + Integration
- **Shared AI services**: Resume parsing, challenge validation, matching engine
- **Cross-platform integration**: Real-time updates, data synchronization
- **Focus**: LLM integration and bias mitigation systems

This architecture provides complete separation of concerns while enabling seamless integration between candidate and recruiter experiences.