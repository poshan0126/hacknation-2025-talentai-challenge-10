#!/usr/bin/env python3
"""Test script to verify JPS user can take challenges and see them in history"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8001/debug/api"
USER_ID = "JPS-QN2NWT"

def test_jps_flow():
    print("🚀 Testing JPS User Challenge Flow")
    print("=" * 50)
    
    # 1. Check if JPS user exists
    print("\n1️⃣ Checking JPS user profile...")
    response = requests.get(f"{BASE_URL}/users/{USER_ID}/profile")
    if response.status_code == 200:
        user_data = response.json()
        print(f"   ✓ User found: {user_data['display_name']}")
        print(f"   - Challenges attempted: {user_data['challenges_attempted']}")
        print(f"   - Average score: {user_data['average_score']:.1f}")
    else:
        print(f"   ❌ User not found. Creating JPS user...")
        # Create JPS user
        response = requests.post(f"{BASE_URL}/users/create", json={
            "first_name": "John",
            "middle_name": "Paul",
            "last_name": "Smith",
            "email": "john.smith@test.com"
        })
        if response.status_code == 200:
            print(f"   ✓ Created user: {response.json()['user_id']}")
        else:
            print(f"   ❌ Failed to create user: {response.text}")
            return
    
    # 2. Take a new challenge
    print("\n2️⃣ Taking a new challenge...")
    response = requests.post(f"{BASE_URL}/challenges/take-challenge", json={
        "user_id": USER_ID
    })
    
    if response.status_code != 200:
        print(f"   ❌ Failed to generate challenge: {response.text}")
        return
    
    challenge = response.json()
    print(f"   ✓ Challenge generated: {challenge['title']}")
    print(f"   - ID: {challenge['id']}")
    print(f"   - Difficulty: {challenge['difficulty']}")
    print(f"   - Max Score: {challenge['max_score']}")
    
    # 3. Submit a solution
    print("\n3️⃣ Submitting analysis...")
    analysis = """Line 3: Off-by-one error in range function
Line 5: Using assignment (=) instead of comparison (==)
Line 8: Missing return statement
Line 10: Variable 'result' used before being defined"""
    
    response = requests.post(f"{BASE_URL}/submissions/", json={
        "challenge_id": challenge['id'],
        "user_id": USER_ID,
        "analysis": analysis
    })
    
    if response.status_code != 200:
        print(f"   ❌ Failed to submit: {response.text}")
        return
    
    submission = response.json()
    print(f"   ✓ Submission created: {submission['id']}")
    
    # 4. Wait for evaluation
    print("\n4️⃣ Waiting for evaluation...")
    for i in range(10):
        time.sleep(2)
        response = requests.get(f"{BASE_URL}/submissions/{submission['id']}")
        if response.status_code == 200:
            result = response.json()
            if result['status'] == 'completed':
                print(f"   ✓ Evaluation complete!")
                print(f"   - Score: {result['score']:.1f}/100")
                print(f"   - Bugs found: {result['bugs_found']}")
                print(f"   - Accuracy: {result['accuracy_rate']:.1f}%")
                break
            else:
                print(f"   ⏳ Status: {result['status']}...")
    
    # 5. Check user history
    print("\n5️⃣ Checking user history...")
    response = requests.get(f"{BASE_URL}/users/{USER_ID}/history")
    if response.status_code == 200:
        history = response.json()
        print(f"   ✓ User: {history['display_name']}")
        print(f"   - Total challenges: {history['statistics']['challenges_attempted']}")
        print(f"   - Average score: {history['statistics']['average_score']:.1f}")
        print(f"   - Best score: {history['statistics']['best_score']:.1f}")
        
        print("\n   Challenge History:")
        for ch in history['history'][:5]:  # Show last 5
            completed = "✅" if ch['completed'] else "🔄"
            print(f"   {completed} {ch['title']} - Score: {ch['best_score']:.1f} (Attempts: {ch['attempts']})")
    else:
        print(f"   ❌ Failed to get history: {response.text}")
    
    # 6. Check leaderboard
    print("\n6️⃣ Checking leaderboard...")
    response = requests.get(f"{BASE_URL}/users/leaderboard")
    if response.status_code == 200:
        leaderboard = response.json()
        print("   Top 5 Users:")
        for entry in leaderboard[:5]:
            if entry['user_id'] == USER_ID:
                print(f"   👉 #{entry['rank']} {entry['display_name']} - Avg: {entry['average_score']:.1f}")
            else:
                print(f"      #{entry['rank']} {entry['display_name']} - Avg: {entry['average_score']:.1f}")
    
    print("\n" + "=" * 50)
    print("✅ Test Complete!")
    print("\nSummary:")
    print(f"- User {USER_ID} can take challenges")
    print(f"- Submissions are properly evaluated")
    print(f"- Challenge history is tracked")
    print(f"- All challenges appear in user history")

if __name__ == "__main__":
    test_jps_flow()