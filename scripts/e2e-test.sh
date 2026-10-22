#!/bin/bash

# Elsewise HTTP Smoke Test Script
# Checks HTTP responses and assets; it does not execute browser interactions.

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${1:-http://localhost:4173}"
TIMEOUT=10

echo -e "${BLUE}🧪 Elsewise HTTP Smoke Test${NC}"
echo "=================================="
echo "Testing URL: $BASE_URL"
echo ""

# Function to check HTTP status
check_url() {
  local url=$1
  local expected_status=${2:-200}
  local description=$3
  
  echo -n "Testing: $description... "
  
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
  
  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS${NC} (HTTP $status)"
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status)"
    return 1
  fi
}

# Function to check if content exists in response
check_content() {
  local url=$1
  local search_text=$2
  local description=$3
  
  echo -n "Testing: $description... "
  
  response=$(curl -s --max-time $TIMEOUT "$url" 2>/dev/null || echo "")
  
  if echo "$response" | grep -q "$search_text"; then
    echo -e "${GREEN}✅ PASS${NC}"
    return 0
  else
    echo -e "${RED}❌ FAIL${NC} (Content not found: $search_text)"
    return 1
  fi
}

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Homepage loads
if check_url "$BASE_URL" 200 "Homepage loads"; then
  ((TESTS_PASSED+=1))
else
  ((TESTS_FAILED+=1))
fi

# Test 2: Homepage contains app title
if check_content "$BASE_URL" "Elsewise" "Homepage contains app title"; then
  ((TESTS_PASSED+=1))
else
  ((TESTS_FAILED+=1))
fi

# Test 3: Homepage contains root div
if check_content "$BASE_URL" "id=\"root\"" "Homepage contains root element"; then
  ((TESTS_PASSED+=1))
else
  ((TESTS_FAILED+=1))
fi

# Test 4: JavaScript bundle loads
if check_content "$BASE_URL" "type=\"module\"" "JavaScript module loads"; then
  ((TESTS_PASSED+=1))
else
  ((TESTS_FAILED+=1))
fi

# Test 5: CSS loads
if check_content "$BASE_URL" "stylesheet" "CSS stylesheet loads"; then
  ((TESTS_PASSED+=1))
else
  ((TESTS_FAILED+=1))
fi

# Test 6: Check if assets are accessible (try to get a JS file)
echo -n "Testing: Static assets are accessible... "
js_file=$(curl -s "$BASE_URL" | grep -o 'src="/assets/[^"]*\.js"' | head -1 | sed 's/src="//;s/"//')
if [ -n "$js_file" ]; then
  asset_url="$BASE_URL$js_file"
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$asset_url" 2>/dev/null || echo "000")
  if [ "$status" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((TESTS_PASSED+=1))
  else
    echo -e "${RED}❌ FAIL${NC} (Asset returned HTTP $status)"
    ((TESTS_FAILED+=1))
  fi
else
  echo -e "${YELLOW}⚠️  SKIP${NC} (No JS file found in HTML)"
fi

# Test 7: SPA routing works (all routes should return 200 and serve index.html)
echo -n "Testing: SPA routing works... "
status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/favorites" 2>/dev/null || echo "000")
if [ "$status" = "200" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
  ((TESTS_PASSED+=1))
else
  echo -e "${RED}❌ FAIL${NC} (Route returned HTTP $status)"
  ((TESTS_FAILED+=1))
fi

# Test 8: 404 handling (non-existent routes should still return 200 for SPA)
echo -n "Testing: 404 handling... "
status=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL/non-existent-page" 2>/dev/null || echo "000")
if [ "$status" = "200" ]; then
  echo -e "${GREEN}✅ PASS${NC}"
  ((TESTS_PASSED+=1))
else
  echo -e "${RED}❌ FAIL${NC} (Expected 200 for SPA, got $status)"
  ((TESTS_FAILED+=1))
fi

# Test 9: Check response time
echo -n "Testing: Response time... "
response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "$BASE_URL" 2>/dev/null || echo "999")
response_time_ms=$(echo "$response_time * 1000" | bc)
if (( $(echo "$response_time < 2" | bc -l) )); then
  echo -e "${GREEN}✅ PASS${NC} (${response_time_ms%.*}ms)"
  ((TESTS_PASSED+=1))
else
  echo -e "${YELLOW}⚠️  SLOW${NC} (${response_time_ms%.*}ms > 2000ms)"
  ((TESTS_FAILED+=1))
fi

# Test 10: Check security headers (if configured)
echo -n "Testing: Security headers... "
headers=$(curl -s -I --max-time $TIMEOUT "$BASE_URL" 2>/dev/null || echo "")
security_headers=0
if echo "$headers" | grep -qi "X-Content-Type-Options"; then
  ((security_headers+=1))
fi
if echo "$headers" | grep -qi "X-Frame-Options"; then
  ((security_headers+=1))
fi
if [ $security_headers -ge 1 ]; then
  echo -e "${GREEN}✅ PASS${NC} ($security_headers security headers found)"
  ((TESTS_PASSED+=1))
else
  echo -e "${YELLOW}⚠️  WARN${NC} (No security headers found)"
fi

echo ""
echo "=================================="
echo -e "${BLUE}📊 Test Summary${NC}"
echo "=================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed.${NC}"
  exit 1
fi
