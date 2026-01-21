#!/usr/bin/env node

/**
 * Smoke Test Script for DealControl API
 * 
 * Calls /health and /version endpoints against API_BASE_URL
 * Exits non-zero on failure
 * 
 * Usage: API_BASE_URL=https://your-api.com node smoke-api.mjs
 */

const API_BASE_URL = process.env.API_BASE_URL || process.env.VITE_API_BASE_URL || 'http://localhost:5000';
const EXPECTED_SPEC_VERSION = process.env.VITE_SPEC_VERSION || 'v1';

console.log('🔍 DealControl API Smoke Test');
console.log(`   Target: ${API_BASE_URL}`);
console.log(`   Expected Spec Version: ${EXPECTED_SPEC_VERSION}`);
console.log('');

async function fetchJSON(endpoint) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });
  
  const requestId = response.headers.get('x-request-id');
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} [${requestId}]`);
  }
  
  const data = await response.json();
  return { data, requestId, status: response.status };
}

async function testHealth() {
  console.log('📍 Testing GET /health...');
  
  try {
    const { data, requestId, status } = await fetchJSON('/health');
    
    console.log(`   ✅ Status: ${status} [${requestId}]`);
    console.log(`   - Service: ${data.service}`);
    console.log(`   - Health: ${data.status}`);
    console.log(`   - Version: ${data.version}`);
    console.log(`   - Spec: ${data.specVersion}`);
    console.log(`   - Env: ${data.env}`);
    console.log(`   - DB Sync: ${data.sync}`);
    
    // Validate required fields
    const requiredFields = ['status', 'service', 'version', 'specVersion', 'env'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    // Check health status
    if (data.status === 'unhealthy') {
      throw new Error('Service reports unhealthy status');
    }
    
    // Check spec version match
    if (data.specVersion !== EXPECTED_SPEC_VERSION) {
      console.warn(`   ⚠️  Spec version mismatch: expected ${EXPECTED_SPEC_VERSION}, got ${data.specVersion}`);
    }
    
    return data;
  } catch (error) {
    console.error(`   ❌ Health check failed: ${error.message}`);
    throw error;
  }
}

async function testVersion() {
  console.log('📍 Testing GET /version...');
  
  try {
    const { data, requestId, status } = await fetchJSON('/version');
    
    console.log(`   ✅ Status: ${status} [${requestId}]`);
    console.log(`   - API Version: ${data.apiVersion}`);
    console.log(`   - Spec Version: ${data.specVersion}`);
    console.log(`   - Build SHA: ${data.buildSha || 'N/A'}`);
    
    // Validate required fields
    const requiredFields = ['apiVersion', 'specVersion'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`   ❌ Version check failed: ${error.message}`);
    throw error;
  }
}

async function runSmokeTests() {
  let exitCode = 0;
  
  try {
    await testHealth();
    console.log('');
    await testVersion();
    console.log('');
    console.log('✅ All smoke tests passed!');
  } catch (error) {
    console.error('');
    console.error('❌ Smoke tests failed:', error.message);
    exitCode = 1;
  }
  
  process.exit(exitCode);
}

runSmokeTests();

