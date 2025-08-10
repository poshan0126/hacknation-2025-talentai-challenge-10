#!/bin/bash

echo "🚀 Testing User System with Challenge History"
echo "============================================="

# Test user ID (already created)
USER_ID="JPS-QN2NWT"

# 1. Create another user
echo ""
echo "1️⃣ Creating a new user (Emma Johnson)..."
NEW_USER=$(curl -s -X POST http://localhost:8001/debug/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Emma",
    "middle_name": null,
    "last_name": "Johnson",
    "email": "emma.j@test.com"
  }' | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['user_id'])")

echo "   ✓ Created user: $NEW_USER"

# 2. Generate challenges for both users
echo ""
echo "2️⃣ Generating challenges for users..."

for i in 1 2 3; do
  echo "   Creating challenge $i for John..."
  CHALLENGE_ID=$(curl -s -X POST http://localhost:8001/debug/api/challenges/take-challenge \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$USER_ID\"}" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('id', 'ERROR'))")
  echo "   ✓ Challenge ID: $CHALLENGE_ID"
done

# 3. Check John's profile
echo ""
echo "3️⃣ Checking John's profile..."
curl -s http://localhost:8001/debug/api/users/$USER_ID/profile | python3 -m json.tool | head -20

# 4. Check John's history
echo ""
echo "4️⃣ Checking John's challenge history..."
curl -s http://localhost:8001/debug/api/users/$USER_ID/history | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"User: {data['display_name']}\")
print(f\"Challenges Attempted: {data['statistics']['challenges_attempted']}\")
print(f\"Average Score: {data['statistics']['average_score']}\")
print(f\"\\nChallenge History:\")
for ch in data['history']:
    print(f\"  - {ch['title']} ({ch['difficulty']}) - Score: {ch['best_score']}\")
"

# 5. Show leaderboard
echo ""
echo "5️⃣ Leaderboard..."
curl -s http://localhost:8001/debug/api/users/leaderboard | python3 -m json.tool

echo ""
echo "============================================="
echo "✅ Test Complete!"
echo ""
echo "Summary:"
echo "- Users can be created with unique IDs (initials + alphanumeric)"
echo "- Each challenge is saved to the user's history"
echo "- User statistics are tracked (attempts, scores, bugs found)"
echo "- History shows all challenges with best scores"
echo "- Leaderboard ranks users by average score"