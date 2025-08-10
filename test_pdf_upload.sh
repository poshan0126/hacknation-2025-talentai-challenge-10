#!/bin/bash

# Test PDF upload through user-resume endpoint
USER_ID="TEST-USER-123"
PDF_FILE="/Users/poshan/Documents/hacknation-2025-talentai-challenge-10/candidate-backend/resume_generator_parser/resume_pdf/ENGINEERING/10030015.pdf"

echo "Testing PDF upload for user: $USER_ID"
echo "Using PDF file: $PDF_FILE"
echo ""

# Upload the PDF
response=$(curl -s -X POST "http://localhost:8001/resume/api/user-resume/upload/$USER_ID" \
  -F "file=@$PDF_FILE")

# Check if successful
if echo "$response" | grep -q "success"; then
  echo "✅ Upload successful!"
  echo ""
  echo "Response:"
  echo "$response" | jq '.'
else
  echo "❌ Upload failed!"
  echo ""
  echo "Response:"
  echo "$response"
fi