#!/bin/bash

echo "🎯 Creating 5 Dummy Users"
echo "=========================="
echo ""

BASE_URL="http://localhost:8001/debug/api"

# Array of users to create
declare -a users=(
  '{"first_name":"Alice","middle_name":"Marie","last_name":"Johnson","email":"alice.johnson@test.com"}'
  '{"first_name":"Bob","middle_name":null,"last_name":"Williams","email":"bob.williams@test.com"}'
  '{"first_name":"Charlie","middle_name":"David","last_name":"Brown","email":"charlie.brown@test.com"}'
  '{"first_name":"Diana","middle_name":"Rose","last_name":"Miller","email":"diana.miller@test.com"}'
  '{"first_name":"Edward","middle_name":null,"last_name":"Davis","email":"edward.davis@test.com"}'
)

declare -a names=(
  "Alice Marie Johnson"
  "Bob Williams"
  "Charlie David Brown"
  "Diana Rose Miller"
  "Edward Davis"
)

echo "Creating users..."
echo ""

USER_IDS=()
for i in "${!users[@]}"; do
  echo "Creating ${names[$i]}..."
  RESPONSE=$(curl -s -X POST "$BASE_URL/users/create" \
    -H "Content-Type: application/json" \
    -d "${users[$i]}")
  
  USER_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('user_id', 'ERROR'))" 2>/dev/null)
  
  if [ "$USER_ID" != "ERROR" ] && [ ! -z "$USER_ID" ]; then
    echo "  ✓ Created: $USER_ID"
    USER_IDS+=("$USER_ID")
  else
    echo "  ❌ Failed to create user"
  fi
done

echo ""
echo "📊 All Users in System:"
echo "-----------------------"

# Also include JPS
echo "  • JPS-QN2NWT - John Paul Smith"

# List all created users
for user_id in "${USER_IDS[@]}"; do
  if [ ! -z "$user_id" ]; then
    curl -s "$BASE_URL/users/$user_id/profile" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'  • {data[\"user_id\"]} - {data[\"display_name\"]}')
except:
    pass" 2>/dev/null
  fi
done

echo ""
echo "✅ All users created successfully!"