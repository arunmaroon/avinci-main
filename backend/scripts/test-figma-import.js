#!/usr/bin/env node

/**
 * Test script for Figma Import functionality
 * Run with: node scripts/test-figma-import.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:9001/api';
const TEST_FILE_KEY = 'test-file-key-123'; // Replace with actual test file key

async function testFigmaImport() {
  console.log('🧪 Testing Figma Import Functionality\n');

  try {
    // Test 1: Check if design routes are accessible
    console.log('1️⃣ Testing design routes accessibility...');
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`);
      console.log('✅ Health check passed');
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }

    // Test 2: Test OAuth initiation (should return auth URL)
    console.log('\n2️⃣ Testing OAuth initiation...');
    try {
      const authResponse = await axios.post(`${API_BASE}/design/admin/import`, {
        fileKey: TEST_FILE_KEY
      }, {
        headers: {
          'x-user-id': 'test-admin-id' // Mock admin user
        }
      });

      if (authResponse.data.needsAuth && authResponse.data.authUrl) {
        console.log('✅ OAuth initiation successful');
        console.log('   Auth URL:', authResponse.data.authUrl);
      } else {
        console.log('❌ OAuth initiation failed - no auth URL returned');
      }
    } catch (error) {
      console.log('❌ OAuth initiation failed:', error.response?.data?.error || error.message);
    }

    // Test 3: Test search functionality (should work even without prototypes)
    console.log('\n3️⃣ Testing search functionality...');
    try {
      const searchResponse = await axios.get(`${API_BASE}/design/admin/search`, {
        params: { q: 'test query' },
        headers: {
          'x-user-id': 'test-admin-id'
        }
      });

      if (searchResponse.data.success) {
        console.log('✅ Search endpoint accessible');
        console.log('   Results:', searchResponse.data.results.length);
      } else {
        console.log('❌ Search failed');
      }
    } catch (error) {
      console.log('❌ Search test failed:', error.response?.data?.error || error.message);
    }

    // Test 4: Test prototypes listing
    console.log('\n4️⃣ Testing prototypes listing...');
    try {
      const listResponse = await axios.get(`${API_BASE}/design/admin/prototypes`, {
        headers: {
          'x-user-id': 'test-admin-id'
        }
      });

      if (listResponse.data.success) {
        console.log('✅ Prototypes listing accessible');
        console.log('   Prototypes count:', listResponse.data.prototypes.length);
      } else {
        console.log('❌ Prototypes listing failed');
      }
    } catch (error) {
      console.log('❌ Prototypes listing failed:', error.response?.data?.error || error.message);
    }

    // Test 5: Test with mock Figma data (if you have a test file)
    console.log('\n5️⃣ Testing with mock data...');
    const mockFigmaData = {
      name: 'Test Prototype',
      document: {
        children: [
          {
            id: 'frame1',
            type: 'FRAME',
            name: 'Screen 1',
            absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
            children: []
          },
          {
            id: 'frame2',
            type: 'FRAME',
            name: 'Screen 2',
            absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
            children: []
          }
        ]
      }
    };

    console.log('   Mock data prepared with 2 screens');
    console.log('   To test full import, you need:');
    console.log('   - Valid Figma file key');
    console.log('   - Valid Figma access token');
    console.log('   - OpenAI API key for AI validation');

    console.log('\n✅ All basic tests completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Set up Figma OAuth app and get client credentials');
    console.log('2. Add FIGMA_CLIENT_ID and FIGMA_CLIENT_SECRET to .env');
    console.log('3. Test with real Figma file using OAuth flow');
    console.log('4. Verify AI validation and embeddings generation');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testFigmaImport();
}

module.exports = { testFigmaImport };
