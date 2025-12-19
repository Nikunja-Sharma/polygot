#!/bin/bash

# AliveStack Integration Tests
# Tests service communication and mood changes based on chaos events
# Requirements: 1.1, 1.3, 1.4

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:3001}"
METRICS_URL="${METRICS_URL:-http://localhost:8000}"
VALIDATOR_URL="${VALIDATOR_URL:-http://localhost:8001}"
LOAD_URL="${LOAD_URL:-http://localhost:8002}"
CHAOS_URL="${CHAOS_URL:-http://localhost:8003}"
RULES_URL="${RULES_URL:-http://localhost:8080}"

PASSED=0
FAILED=0

# Helper functions
log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

check_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    log_info "Testing $name at $url"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        log_pass "$name returned $response"
        return 0
    else
        log_fail "$name returned $response (expected $expected_status)"
        return 1
    fi
}

check_json_field() {
    local name=$1
    local url=$2
    local field=$3
    
    log_info "Testing $name - checking field '$field'"
    
    response=$(curl -s "$url" --max-time 10 2>/dev/null || echo "{}")
    
    if echo "$response" | grep -q "\"$field\""; then
        log_pass "$name contains field '$field'"
        return 0
    else
        log_fail "$name missing field '$field'"
        return 1
    fi
}

# ============================================
# Test Suite: Service Health Checks
# ============================================
echo ""
echo "=========================================="
echo "  Service Health Check Tests"
echo "=========================================="

check_endpoint "API Gateway Health" "$API_URL/api/health"
check_endpoint "Python Metrics Health" "$METRICS_URL/health"
check_endpoint "Rust Validator Health" "$VALIDATOR_URL/health"
check_endpoint "Go Load Health" "$LOAD_URL/health"
check_endpoint "C++ Chaos Health" "$CHAOS_URL/health"
check_endpoint "Java Rules Health" "$RULES_URL/health"

# ============================================
# Test Suite: Service Communication
# ============================================
echo ""
echo "=========================================="
echo "  Service Communication Tests"
echo "=========================================="

# Test API Gateway aggregates all services (Requirement 1.1)
log_info "Testing API Gateway aggregation"
status_response=$(curl -s "$API_URL/api/status" --max-time 10 2>/dev/null || echo "{}")

if echo "$status_response" | grep -q '"pet"' && \
   echo "$status_response" | grep -q '"metrics"' && \
   echo "$status_response" | grep -q '"services"'; then
    log_pass "API Gateway aggregates pet, metrics, and services data"
else
    log_fail "API Gateway missing expected aggregation fields"
fi

# Test Python Metrics returns CPU/memory
check_json_field "Python Metrics" "$METRICS_URL/metrics" "cpu"
check_json_field "Python Metrics" "$METRICS_URL/metrics" "memory"

# Test Rust Validator returns service statuses
check_json_field "Rust Validator" "$VALIDATOR_URL/validate" "services"

# Test Go Load status endpoint
check_json_field "Go Load Status" "$LOAD_URL/load/status" "active"

# Test Java Rules evaluation
log_info "Testing Java Rules Engine evaluation"
rules_response=$(curl -s -X POST "$RULES_URL/rules/evaluate" \
    -H "Content-Type: application/json" \
    -d '{"cpu": 50, "memory": 50, "errorRate": 0, "serviceHealth": {"healthy": 5, "degraded": 0, "offline": 0}}' \
    --max-time 10 2>/dev/null || echo "{}")

if echo "$rules_response" | grep -q '"mood"'; then
    log_pass "Java Rules Engine returns mood evaluation"
else
    log_fail "Java Rules Engine failed to return mood"
fi

# ============================================
# Test Suite: Pet Mood Logic (Requirement 1.3, 1.4)
# ============================================
echo ""
echo "=========================================="
echo "  Pet Mood Logic Tests"
echo "=========================================="

# Test HAPPY mood when all systems normal
log_info "Testing HAPPY mood (all systems normal)"
happy_response=$(curl -s -X POST "$RULES_URL/rules/evaluate" \
    -H "Content-Type: application/json" \
    -d '{"cpu": 30, "memory": 40, "errorRate": 0, "serviceHealth": {"healthy": 5, "degraded": 0, "offline": 0}}' \
    --max-time 10 2>/dev/null || echo "{}")

if echo "$happy_response" | grep -q '"HAPPY"'; then
    log_pass "Pet is HAPPY when all systems normal"
else
    log_fail "Pet should be HAPPY when all systems normal"
fi

# Test ANGRY mood when CPU > 90%
log_info "Testing ANGRY mood (high CPU)"
angry_response=$(curl -s -X POST "$RULES_URL/rules/evaluate" \
    -H "Content-Type: application/json" \
    -d '{"cpu": 95, "memory": 40, "errorRate": 0, "serviceHealth": {"healthy": 5, "degraded": 0, "offline": 0}}' \
    --max-time 10 2>/dev/null || echo "{}")

if echo "$angry_response" | grep -q '"ANGRY"'; then
    log_pass "Pet is ANGRY when CPU > 90%"
else
    log_fail "Pet should be ANGRY when CPU > 90%"
fi

# Test SAD mood when error rate > 10%
log_info "Testing SAD mood (high error rate)"
sad_response=$(curl -s -X POST "$RULES_URL/rules/evaluate" \
    -H "Content-Type: application/json" \
    -d '{"cpu": 30, "memory": 40, "errorRate": 15, "serviceHealth": {"healthy": 5, "degraded": 0, "offline": 0}}' \
    --max-time 10 2>/dev/null || echo "{}")

if echo "$sad_response" | grep -q '"SAD"'; then
    log_pass "Pet is SAD when error rate > 10%"
else
    log_fail "Pet should be SAD when error rate > 10%"
fi

# Test SICK mood when service offline
log_info "Testing SICK mood (service offline)"
sick_response=$(curl -s -X POST "$RULES_URL/rules/evaluate" \
    -H "Content-Type: application/json" \
    -d '{"cpu": 30, "memory": 40, "errorRate": 0, "serviceHealth": {"healthy": 4, "degraded": 0, "offline": 1}}' \
    --max-time 10 2>/dev/null || echo "{}")

if echo "$sick_response" | grep -q '"SICK"'; then
    log_pass "Pet is SICK when service offline"
else
    log_fail "Pet should be SICK when service offline"
fi

# ============================================
# Test Suite: Chaos Events
# ============================================
echo ""
echo "=========================================="
echo "  Chaos Event Tests"
echo "=========================================="

# Test CPU chaos endpoint accepts requests
log_info "Testing CPU chaos endpoint (short duration)"
cpu_chaos_response=$(curl -s -X POST "$CHAOS_URL/chaos/cpu" \
    -H "Content-Type: application/json" \
    -d '{"duration_seconds": 1}' \
    --max-time 15 2>/dev/null || echo "{}")

if echo "$cpu_chaos_response" | grep -q '"completed"' || echo "$cpu_chaos_response" | grep -q '"type"'; then
    log_pass "CPU chaos endpoint responds correctly"
else
    log_fail "CPU chaos endpoint failed"
fi

# Test memory chaos endpoint accepts requests
log_info "Testing memory chaos endpoint (small allocation)"
mem_chaos_response=$(curl -s -X POST "$CHAOS_URL/chaos/memory" \
    -H "Content-Type: application/json" \
    -d '{"megabytes": 10}' \
    --max-time 15 2>/dev/null || echo "{}")

if echo "$mem_chaos_response" | grep -q '"completed"' || echo "$mem_chaos_response" | grep -q '"type"'; then
    log_pass "Memory chaos endpoint responds correctly"
else
    log_fail "Memory chaos endpoint failed"
fi

# ============================================
# Test Suite: Load Simulator
# ============================================
echo ""
echo "=========================================="
echo "  Load Simulator Tests"
echo "=========================================="

# Test load start/stop cycle
log_info "Testing load simulator start"
start_response=$(curl -s -X POST "$LOAD_URL/load/start" \
    -H "Content-Type: application/json" \
    -d '{"rps": 10, "target": "http://localhost:3001/api/health"}' \
    --max-time 10 2>/dev/null || echo "{}")

if echo "$start_response" | grep -q '"active"' || echo "$start_response" | grep -q '"status"'; then
    log_pass "Load simulator start endpoint responds"
else
    log_fail "Load simulator start failed"
fi

# Brief pause to let load run
sleep 2

# Check load status
log_info "Testing load simulator status"
load_status=$(curl -s "$LOAD_URL/load/status" --max-time 10 2>/dev/null || echo "{}")

if echo "$load_status" | grep -q '"active"'; then
    log_pass "Load simulator status endpoint responds"
else
    log_fail "Load simulator status failed"
fi

# Stop load
log_info "Testing load simulator stop"
stop_response=$(curl -s -X POST "$LOAD_URL/load/stop" --max-time 10 2>/dev/null || echo "{}")

if echo "$stop_response" | grep -q '"active"' || echo "$stop_response" | grep -q '"status"'; then
    log_pass "Load simulator stop endpoint responds"
else
    log_fail "Load simulator stop failed"
fi

# ============================================
# Summary
# ============================================
echo ""
echo "=========================================="
echo "  Test Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All integration tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Check the output above.${NC}"
    exit 1
fi
