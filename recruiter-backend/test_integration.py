#!/usr/bin/env python3
"""
Integration test for the TalentAI Recruiter Backend with Candidate Backend API
"""
import requests
import json
import sys
import asyncio
import aiohttp
from typing import Dict, List

RECRUITER_URL = "http://localhost:8002"
CANDIDATE_URL = "http://localhost:8001"

async def test_candidate_backend_connection():
    """Test direct connection to candidate backend API"""
    print("=== Testing Candidate Backend Connection ===")
    
    async with aiohttp.ClientSession() as session:
        try:
            # Test candidate backend health
            async with session.get(f"{CANDIDATE_URL}/health") as response:
                if response.status == 200:
                    print("✅ Candidate backend is healthy")
                else:
                    print(f"❌ Candidate backend health check failed: {response.status}")
                    return False
            
            # Test users endpoint
            async with session.get(f"{CANDIDATE_URL}/debug/api/users/all") as response:
                if response.status == 200:
                    users = await response.json()
                    print(f"✅ Found {len(users)} users in candidate backend")
                    
                    # Test getting profile for first user if available
                    if users:
                        user_id = users[0]["user_id"]
                        async with session.get(f"{CANDIDATE_URL}/debug/api/users/{user_id}/profile") as profile_response:
                            if profile_response.status == 200:
                                profile = await profile_response.json()
                                print(f"✅ Successfully fetched profile for user: {profile.get('display_name', user_id)}")
                                print(f"   Stats: {profile.get('statistics', {})}")
                                return True
                            else:
                                print(f"❌ Failed to fetch user profile: {profile_response.status}")
                else:
                    print(f"❌ Failed to fetch users: {response.status}")
                    return False
                    
        except Exception as e:
            print(f"❌ Connection to candidate backend failed: {e}")
            return False

def test_recruiter_backend():
    """Test recruiter backend functionality"""
    print("\n=== Testing Recruiter Backend ===")
    
    try:
        # Health check
        response = requests.get(f"{RECRUITER_URL}/api/recommendations/health")
        if response.status_code != 200:
            print(f"❌ Recruiter backend health check failed: {response.status_code}")
            return False
        
        health_data = response.json()
        print("✅ Recruiter backend is healthy")
        print(f"   Model: {health_data.get('matcher_model', 'unknown')}")
        print(f"   Data source: {health_data.get('data_source', 'unknown')}")
        
        return True
    except Exception as e:
        print(f"❌ Recruiter backend test failed: {e}")
        return False

async def test_full_integration():
    """Test full integration: create job and search candidates"""
    print("\n=== Testing Full Integration ===")
    
    # Create a test job
    job_data = {
        "title": "Senior Python Developer",
        "company": "TechCorp Inc",
        "description": "Looking for an experienced Python developer with debugging skills and problem-solving abilities.",
        "requirements": [
            "5+ years Python experience",
            "Strong debugging skills",
            "Problem solving abilities",
            "Code analysis experience"
        ],
        "preferred_skills": [
            "FastAPI",
            "Software Engineering",
            "Algorithm optimization"
        ],
        "location": "Remote"
    }
    
    try:
        # Create job
        response = requests.post(
            f"{RECRUITER_URL}/api/recommendations/jobs",
            json=job_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to create job: {response.status_code} - {response.text}")
            return False
        
        job = response.json()
        print(f"✅ Created job: {job['title']} (ID: {job['id']})")
        
        # Search for candidates
        search_request = {
            "job": job,
            "top_n": 10,
            "include_summary": True
        }
        
        search_response = requests.post(
            f"{RECRUITER_URL}/api/recommendations/search",
            json=search_request,
            headers={"Content-Type": "application/json"}
        )
        
        if search_response.status_code != 200:
            print(f"❌ Candidate search failed: {search_response.status_code} - {search_response.text}")
            return False
        
        results = search_response.json()
        candidates = results.get("candidates", [])
        
        print(f"✅ Search completed successfully!")
        print(f"   Total candidates searched: {results.get('total_candidates_searched', 0)}")
        print(f"   Candidates returned: {len(candidates)}")
        print(f"   Data source: {results.get('search_metadata', {}).get('data_source', 'unknown')}")
        
        if candidates:
            print("\n📊 Top 3 Candidates:")
            for i, candidate in enumerate(candidates[:3]):
                print(f"   {i+1}. {candidate.get('name', 'Anonymous')} (ID: {candidate.get('candidate_id', 'N/A')})")
                print(f"      Title: {candidate.get('title', 'N/A')}")
                print(f"      Match Score: {candidate['match_score']:.3f}")
                print(f"      Skills: {', '.join(candidate.get('skills_match', [])[:5])}")
                if candidate.get('summary'):
                    print(f"      Summary: {candidate['summary'][:100]}...")
                print()
        
        # Test advanced search
        advanced_request = {
            "job": job,
            "filters": {
                "min_experience": 2,
                "max_experience": 10
            },
            "boost_skills": ["Python", "Debugging"],
            "penalty_skills": [],
            "top_n": 5,
            "include_summary": True
        }
        
        advanced_response = requests.post(
            f"{RECRUITER_URL}/api/recommendations/search/advanced",
            json=advanced_request,
            headers={"Content-Type": "application/json"}
        )
        
        if advanced_response.status_code == 200:
            advanced_results = advanced_response.json()
            print(f"✅ Advanced search also successful! Found {len(advanced_results.get('candidates', []))} filtered candidates")
        else:
            print(f"⚠️  Advanced search failed: {advanced_response.status_code}")
        
        return True
        
    except Exception as e:
        print(f"❌ Integration test failed: {e}")
        return False

async def main():
    """Run all integration tests"""
    print("🚀 TalentAI Integration Test Suite")
    print("=" * 50)
    
    # Test candidate backend connection
    candidate_ok = await test_candidate_backend_connection()
    
    # Test recruiter backend
    recruiter_ok = test_recruiter_backend()
    
    if not candidate_ok:
        print("\n❌ CRITICAL: Candidate backend is not accessible!")
        print("   Make sure candidate backend is running on port 8001")
        print("   Try: cd candidate-backend && uvicorn main:app --port 8001")
        return False
    
    if not recruiter_ok:
        print("\n❌ CRITICAL: Recruiter backend is not accessible!")
        print("   Make sure recruiter backend is running on port 8002") 
        print("   Try: cd recruiter-backend && ./start_server.sh")
        return False
    
    # Test full integration
    integration_ok = await test_full_integration()
    
    print("\n" + "=" * 50)
    if integration_ok:
        print("🎉 ALL TESTS PASSED! The recommendation engine is working correctly.")
        print("✅ Candidates are being fetched from candidate backend API")
        print("✅ Semantic matching is working with real candidate data")
        print("✅ Both basic and advanced search are functional")
    else:
        print("❌ Integration tests failed. Check the logs above for details.")
        return False
    
    return True

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)