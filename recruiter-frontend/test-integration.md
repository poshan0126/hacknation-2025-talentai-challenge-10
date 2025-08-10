# Frontend-Backend Integration Test Guide

## Setup Instructions

### 1. Start Backend Services

**Candidate Backend (Port 8001)**
```bash
cd candidate-backend
uvicorn main:app --port 8001
```

**Recruiter Backend (Port 8002)**  
```bash
cd recruiter-backend
./start_server.sh
```

### 2. Start Frontend

**Recruiter Frontend (Port 3000)**
```bash
cd recruiter-frontend
npm run dev
```

## Testing the Integration

### Step 1: Verify Backend Connectivity
1. Test candidate backend: http://localhost:8001/health
2. Test recruiter backend: http://localhost:8002/api/recommendations/health

### Step 2: Test API Integration
1. Navigate to: http://localhost:3000/jobs/1
2. The page should show:
   - ✅ "Fetching candidates from AI..." loading message
   - ✅ Loading skeleton cards (6 placeholder cards)
   - ✅ After 5-30 seconds: Real candidates from the recommendation API

### Step 3: Verify Candidate Data
Expected behavior:
- **Real candidates** fetched from candidate backend API
- **Match scores** between 0-100%
- **Skills** from candidate profiles or inferred from challenge activity
- **Titles** inferred from challenge performance
- **Summaries** generated from user statistics

### Step 4: Test Error Handling
To test error scenarios:
1. Stop the recruiter backend (Ctrl+C)
2. Refresh the job page
3. Should show: Red error card with "Try Again" button

### Step 5: Test Refresh Functionality
1. Click the "Refresh" button in the candidates section
2. Should re-fetch candidates from the API
3. Loading state should appear again

## Expected API Flow

```
1. Frontend loads job page (http://localhost:3000/jobs/1)
2. Frontend calls: POST http://localhost:8002/api/recommendations/search
3. Recruiter backend calls: GET http://localhost:8001/debug/api/users/all
4. Recruiter backend calls: GET http://localhost:8001/debug/api/users/{id}/profile (for each user)
5. Recruiter backend performs semantic matching
6. Frontend displays candidates with real match scores
```

## Troubleshooting

**No candidates returned:**
- Check candidate backend has users in debugging challenge system
- Verify candidate backend is accessible from recruiter backend

**API timeout errors:**
- Default timeout is 30 seconds
- Large candidate pools may take longer to process

**CORS errors:**
- Ensure all services are running on correct ports
- Check browser developer tools for network errors

## Development Notes

- Job details are currently static in the frontend
- Real job-candidate matching uses actual skills and requirements
- Match scores reflect semantic similarity + skills alignment
- Candidates are fetched fresh each time (no caching)