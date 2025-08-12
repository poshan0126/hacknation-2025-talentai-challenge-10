#!/usr/bin/env python3
"""
Test script for the TalentAI Recruiter Backend API
"""
import requests
import json
import sys

BASE_URL = "http://localhost:8002"

def test_health():
    """Test health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/recommendations/health")
        print(f"Health Check: {response.status_code}")
        health_data = response.json()
        print(json.dumps(health_data, indent=2))
        
        # Check if using API data source
        if health_data.get("data_source") == "candidate_backend_api":
            print("✅ Using candidate backend API as data source")
        else:
            print("⚠️  Not using candidate backend API")
            
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_create_sample_job():
    """Test creating a sample job"""
    try:
        response = requests.post(f"{BASE_URL}/api/recommendations/test/sample-job")
        print(f"Create Sample Job: {response.status_code}")
        if response.status_code == 200:
            job = response.json()
            print(f"Created job: {job['title']} at {job['company']}")
            return job
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Sample job creation failed: {e}")
        return None

def test_search_candidates(job):
    """Test candidate search"""
    if not job:
        print("No job to search with")
        return
    
    search_request = {
        "job": job,
        "top_n": 5,
        "include_summary": True
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/recommendations/search",
            json=search_request,
            headers={"Content-Type": "application/json"}
        )
        print(f"Candidate Search: {response.status_code}")
        if response.status_code == 200:
            results = response.json()
            print(f"✅ Found {len(results['candidates'])} candidates from API")
            print(f"Total candidates searched: {results.get('total_candidates_searched', 0)}")
            print(f"Data source: {results.get('search_metadata', {}).get('data_source', 'unknown')}")
            print()
            
            for i, candidate in enumerate(results['candidates'][:3]):
                print(f"  {i+1}. {candidate.get('name', 'Anonymous')} (ID: {candidate.get('candidate_id', 'N/A')})")
                print(f"     Title: {candidate.get('title', 'N/A')}")
                print(f"     Score: {candidate['match_score']:.3f}")
                print(f"     Skills: {', '.join(candidate['skills_match'][:5])}")
                if candidate.get('summary'):
                    print(f"     Summary: {candidate['summary'][:100]}...")
                print()
        else:
            print(f"❌ Search error: {response.text}")
    except Exception as e:
        print(f"❌ Search failed: {e}")

def main():
    print("=== TalentAI Recruiter Backend API Test ===\n")
    
    # Test health
    if not test_health():
        print("Server is not healthy. Make sure it's running on port 8002")
        sys.exit(1)
    
    print("\n" + "="*50 + "\n")
    
    # Create sample job
    job = test_create_sample_job()
    
    print("\n" + "="*50 + "\n")
    
    # Test candidate search
    test_search_candidates(job)
    
    print("\n=== Test Complete ===")

if __name__ == "__main__":
    main()