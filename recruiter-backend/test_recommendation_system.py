#!/usr/bin/env python3
"""
Test script for the Candidate Recommendation System integration
"""
import asyncio
import sys
import os
from pathlib import Path

# Add the current directory to Python path to resolve imports
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Also add the parent directory to handle any nested imports
parent_dir = current_dir.parent
if str(parent_dir) not in sys.path:
    sys.path.insert(0, str(parent_dir))

print(f"🔍 Current working directory: {os.getcwd()}")
print(f"🔍 Python path includes:")
for i, path in enumerate(sys.path[:5]):  # Show first 5 paths
    print(f"   {i}: {path}")

# Now we can import the services
try:
    from services.candidate_recommendation import CandidateRecommendationService
    from services.matching_engine import MatchingEngine
    print("✅ Successfully imported services")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Trying alternative import method...")
    
    # Alternative import method
    try:
        import services.candidate_recommendation as candidate_service
        import services.matching_engine as matching_service
        CandidateRecommendationService = candidate_service.CandidateRecommendationService
        MatchingEngine = matching_service.MatchingEngine
        print("✅ Successfully imported services using alternative method")
    except ImportError as e2:
        print(f"❌ Alternative import also failed: {e2}")
        print("Please run this script from the recruiter-backend directory")
        sys.exit(1)


async def test_candidate_recommendation_service():
    """Test the candidate recommendation service"""
    print("🧪 Testing Candidate Recommendation Service...")
    
    try:
        # Initialize the service
        service = CandidateRecommendationService()
        
        # Test system status
        print("\n📊 System Status:")
        status = await service.get_system_status()
        for key, value in status.items():
            print(f"  {key}: {value}")
        
        # Test with a sample job
        sample_job = {
            "title": "Software Engineer",
            "company": "TechCorp",
            "description": "We are looking for a software engineer with experience in Python, FastAPI, and PostgreSQL. The ideal candidate should have 3+ years of experience in web development and be familiar with Docker and cloud platforms.",
            "required_skills": ["Python", "FastAPI", "PostgreSQL", "Web Development"],
            "preferred_skills": ["Docker", "AWS", "React", "TypeScript"],
            "min_experience_years": 3
        }
        
        print(f"\n🔍 Testing with job: {sample_job['title']}")
        recommendations = await service.get_candidate_recommendations(sample_job, top_k=5)
        
        if recommendations:
            print(f"✅ Found {len(recommendations)} recommendations:")
            for i, rec in enumerate(recommendations, 1):
                print(f"\n  {i}. {rec['candidate_name']} (Score: {rec['overall_score']:.3f})")
                print(f"     Skills: {', '.join(rec['candidate_skills'][:5])}")
                print(f"     Summary: {rec['candidate_summary'][:100]}...")
        else:
            print("⚠️ No recommendations found")
            
    except Exception as e:
        print(f"❌ Error testing candidate recommendation service: {e}")
        import traceback
        traceback.print_exc()


async def test_matching_engine():
    """Test the matching engine"""
    print("\n🧪 Testing Matching Engine...")
    
    try:
        # Initialize the engine
        engine = MatchingEngine()
        
        # Test system status
        print("\n📊 Engine Status:")
        status = await engine.get_system_status()
        for key, value in status.items():
            print(f"  {key}: {value}")
        
        # Test with sample data
        sample_job = {
            "title": "Data Scientist",
            "description": "Looking for a data scientist with ML experience",
            "required_skills": ["Python", "Machine Learning", "Statistics"],
            "preferred_skills": ["Deep Learning", "TensorFlow", "SQL"]
        }
        
        sample_candidates = [
            {
                "id": "candidate_1",
                "name": "John Doe",
                "summary": "Experienced data scientist with 5 years in ML",
                "skills": ["Python", "Machine Learning", "Statistics", "Deep Learning"],
                "experience": [{"title": "Data Scientist", "company": "TechCorp", "duration": "3 years"}],
                "education": [{"degree": "MS", "field": "Computer Science"}]
            },
            {
                "id": "candidate_2", 
                "name": "Jane Smith",
                "summary": "Software engineer with some ML background",
                "skills": ["Python", "JavaScript", "Machine Learning"],
                "experience": [{"title": "Software Engineer", "company": "Startup", "duration": "2 years"}],
                "education": [{"degree": "BS", "field": "Engineering"}]
            }
        ]
        
        print(f"\n🔍 Testing with job: {sample_job['title']}")
        matches = await engine.find_candidates_for_job(
            job_data=sample_job,
            candidates=sample_candidates,
            top_k=2,
            use_recommendation_system=False  # Use manual matching for this test
        )
        
        if matches:
            print(f"✅ Found {len(matches)} matches:")
            for i, match in enumerate(matches, 1):
                print(f"\n  {i}. {match['candidate_name']} (Score: {match['overall_score']:.3f})")
                print(f"     Semantic: {match['semantic_score']:.3f}")
                print(f"     Skills: {match['skills_score']:.3f}")
                print(f"     Experience: {match['experience_score']:.3f}")
                print(f"     Title: {match['title_score']:.3f}")
                print(f"     Analysis: {match['ai_analysis']}")
        else:
            print("⚠️ No matches found")
            
    except Exception as e:
        print(f"❌ Error testing matching engine: {e}")
        import traceback
        traceback.print_exc()


async def test_integration():
    """Test the full integration"""
    print("\n🧪 Testing Full Integration...")
    
    try:
        # Test the complete flow
        engine = MatchingEngine()
        
        sample_job = {
            "title": "Full Stack Developer",
            "company": "Innovation Labs",
            "description": "We need a full stack developer who can work with modern web technologies and has experience in both frontend and backend development.",
            "required_skills": ["JavaScript", "React", "Node.js", "Python"],
            "preferred_skills": ["TypeScript", "Docker", "AWS", "MongoDB"],
            "min_experience_years": 2
        }
        
        print(f"\n🔍 Testing full integration with job: {sample_job['title']}")
        
        # Try to use the recommendation system first
        matches = await engine.find_candidates_for_job(
            job_data=sample_job,
            top_k=3,
            use_recommendation_system=True
        )
        
        if matches:
            print(f"✅ Integration test successful! Found {len(matches)} candidates:")
            for i, match in enumerate(matches, 1):
                print(f"\n  {i}. {match.get('candidate_name', 'Unknown')} (Score: {match['overall_score']:.3f})")
                print(f"     Skills: {', '.join(match.get('candidate_skills', [])[:5])}")
                print(f"     Summary: {match.get('candidate_summary', '')[:100]}...")
        else:
            print("⚠️ No candidates found in integration test")
            
    except Exception as e:
        print(f"❌ Error in integration test: {e}")
        import traceback
        traceback.print_exc()


async def main():
    """Main test function"""
    print("🚀 Starting Candidate Recommendation System Tests")
    print("=" * 60)
    
    # Test individual components
    await test_candidate_recommendation_service()
    await test_matching_engine()
    await test_integration()
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")


if __name__ == "__main__":
    asyncio.run(main())
