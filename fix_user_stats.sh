#!/bin/bash

echo "🔧 Fixing User Statistics for JPS"
echo "=================================="

USER_ID="JPS-QN2NWT"
BASE_URL="http://localhost:8001/debug/api"

# Force recalculation of statistics
echo "Triggering statistics update..."
curl -X POST "$BASE_URL/users/$USER_ID/update-stats" 2>/dev/null

# Check updated profile
echo ""
echo "Updated Statistics:"
curl -s "$BASE_URL/users/$USER_ID/profile" | python3 -c "
import sys, json
data = json.load(sys.stdin)
stats = data['statistics']
print(f'  User: {data[\"display_name\"]} ({data[\"user_id\"]})')
print(f'  Challenges Attempted: {stats[\"challenges_attempted\"]}')
print(f'  Challenges Completed: {stats[\"challenges_completed\"]}')
print(f'  Total Score: {stats[\"total_score\"]:.1f}')
print(f'  Average Score: {stats[\"average_score\"]:.1f}%')
print(f'  Highest Score: {stats[\"highest_score\"]:.1f}')
print(f'  Bugs Found: {stats[\"total_bugs_found\"]}')
print(f'  Bugs Missed: {stats[\"total_bugs_missed\"]}')
"

echo ""
echo "✅ Done!"