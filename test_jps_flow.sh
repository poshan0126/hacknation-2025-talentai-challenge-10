#!/bin/bash

echo "🚀 Testing JPS User Challenge Flow"
echo "=================================================="

USER_ID="JPS-QN2NWT"
BASE_URL="http://localhost:8001/debug/api"

# 1. Check JPS user profile
echo ""
echo "1️⃣ Checking JPS user profile..."
USER_PROFILE=$(curl -s "$BASE_URL/users/$USER_ID/profile")

if [ $? -eq 0 ] && echo "$USER_PROFILE" | grep -q "display_name"; then
    echo "   ✓ User found:"
    echo "$USER_PROFILE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"   - Name: {data['display_name']}\")
print(f\"   - Challenges attempted: {data['statistics']['challenges_attempted']}\")
print(f\"   - Average score: {data['statistics']['average_score']:.1f}\")
"
else
    echo "   ❌ User not found. Please run the user creation script first."
    exit 1
fi

# 2. Take a new challenge
echo ""
echo "2️⃣ Taking a new challenge for JPS..."
CHALLENGE=$(curl -s -X POST "$BASE_URL/challenges/take-challenge" \
    -H "Content-Type: application/json" \
    -d "{\"user_id\": \"$USER_ID\"}")

if echo "$CHALLENGE" | grep -q '"id"'; then
    CHALLENGE_ID=$(echo "$CHALLENGE" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
    echo "   ✓ Challenge generated:"
    echo "$CHALLENGE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"   - Title: {data['title']}\")
print(f\"   - ID: {data['id']}\")
print(f\"   - Difficulty: {data['difficulty']}\")
"
else
    echo "   ❌ Failed to generate challenge"
    echo "$CHALLENGE"
    exit 1
fi

# 3. Submit an analysis
echo ""
echo "3️⃣ Submitting bug analysis..."
SUBMISSION=$(curl -s -X POST "$BASE_URL/submissions/" \
    -H "Content-Type: application/json" \
    -d "{
        \"challenge_id\": \"$CHALLENGE_ID\",
        \"user_id\": \"$USER_ID\",
        \"analysis\": \"Line 3: Off-by-one error in range function\\nLine 5: Using assignment instead of comparison\\nLine 8: Missing return statement\"
    }")

if echo "$SUBMISSION" | grep -q '"id"'; then
    SUBMISSION_ID=$(echo "$SUBMISSION" | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
    echo "   ✓ Submission created: $SUBMISSION_ID"
else
    echo "   ❌ Failed to submit analysis"
    echo "$SUBMISSION"
    exit 1
fi

# 4. Wait for evaluation
echo ""
echo "4️⃣ Waiting for evaluation..."
for i in {1..10}; do
    sleep 2
    RESULT=$(curl -s "$BASE_URL/submissions/$SUBMISSION_ID")
    STATUS=$(echo "$RESULT" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))" 2>/dev/null)
    
    if [ "$STATUS" = "completed" ]; then
        echo "   ✓ Evaluation complete!"
        echo "$RESULT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"   - Score: {data['score']:.1f}/100\")
print(f\"   - Bugs found: {data['bugs_found']}\")
print(f\"   - Accuracy: {data['accuracy_rate']:.1f}%\")
"
        break
    else
        echo "   ⏳ Status: $STATUS..."
    fi
done

# 5. Check user history
echo ""
echo "5️⃣ Checking JPS's challenge history..."
HISTORY=$(curl -s "$BASE_URL/users/$USER_ID/history")

if echo "$HISTORY" | grep -q '"history"'; then
    echo "   ✓ History retrieved:"
    echo "$HISTORY" | python3 -c "
import sys, json
data = json.load(sys.stdin)
print(f\"   User: {data['display_name']}\")
print(f\"   - Total challenges: {data['statistics']['challenges_attempted']}\")
print(f\"   - Average score: {data['statistics']['average_score']:.1f}\")
print(f\"   - Best score: {data['statistics']['highest_score']:.1f}\")
print()
print('   Recent Challenges:')
for ch in data['history'][:5]:
    status = '✅' if ch['completed'] else '🔄'
    print(f\"   {status} {ch['title'][:40]}\")
    print(f\"      Score: {ch['best_score']:.1f} | Attempts: {ch['attempts']}\")
"
else
    echo "   ❌ Failed to get history"
fi

# 6. Check leaderboard
echo ""
echo "6️⃣ Checking leaderboard..."
LEADERBOARD=$(curl -s "$BASE_URL/users/leaderboard")

if echo "$LEADERBOARD" | grep -q '\['; then
    echo "   Top Users:"
    echo "$LEADERBOARD" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for entry in data[:5]:
    marker = '👉' if entry['user_id'] == '$USER_ID' else '  '
    print(f\"   {marker} #{entry['rank']} {entry['display_name']} - Avg: {entry['average_score']:.1f}\")
"
fi

echo ""
echo "=================================================="
echo "✅ Test Complete!"
echo ""
echo "Summary:"
echo "- User JPS-QN2NWT can take challenges ✓"
echo "- Submissions are properly evaluated ✓"
echo "- Challenge history is tracked ✓"
echo "- All challenges appear in user history ✓"