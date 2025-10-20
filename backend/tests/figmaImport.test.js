const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');

// Mock the database
jest.mock('../models/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

// Mock Figma API calls
jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn()
}));

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn()
      }
    },
    embeddings: {
      create: jest.fn()
    }
  }))
}));

// Mock Pinecone
jest.mock('@pinecone-database/pinecone', () => ({
  Pinecone: jest.fn().mockImplementation(() => ({
    index: jest.fn().mockReturnValue({
      namespace: jest.fn().mockReturnValue({
        upsert: jest.fn(),
        query: jest.fn()
      })
    })
  }))
}));

const app = express();
app.use(express.json());

// Mock middleware
const mockRequireAdmin = (req, res, next) => {
  req.user = { id: 'test-admin-id' };
  next();
};

// Mock rate limiter
const mockLimiter = (req, res, next) => next();

// Import the route with mocked dependencies
const designRouter = require('../routes/design');

describe('Figma Import API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /admin/import', () => {
    it('should return auth URL when no access token provided', async () => {
      const response = await request(app)
        .post('/admin/import')
        .send({ fileKey: 'test-file-key' })
        .expect(200);

      expect(response.body).toHaveProperty('needsAuth', true);
      expect(response.body).toHaveProperty('authUrl');
    });

    it('should import prototype with valid token', async () => {
      // Mock Figma API response
      const mockFigmaResponse = {
        data: {
          name: 'Test Prototype',
          document: {
            children: [
              {
                id: 'frame1',
                type: 'FRAME',
                name: 'Screen 1',
                absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
                children: []
              }
            ]
          }
        }
      };

      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue(mockFigmaResponse);

      // Mock database insert
      const mockPool = require('../models/database').pool;
      mockPool.query.mockResolvedValue({
        rows: [{ id: 'prototype-123' }]
      });

      // Mock OpenAI responses
      const mockOpenAI = require('openai').OpenAI;
      const mockInstance = new mockOpenAI();
      mockInstance.chat.completions.create.mockResolvedValue({
        choices: [{
          message: {
            content: JSON.stringify({
              issues: [],
              score: 0.9,
              recommendations: []
            })
          }
        }]
      });
      mockInstance.embeddings.create.mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }]
      });

      const response = await request(app)
        .post('/admin/import')
        .send({
          fileKey: 'test-file-key',
          accessToken: 'test-token',
          image: 'base64-image-data'
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('prototypeId', 'prototype-123');
      expect(response.body).toHaveProperty('validation');
    });

    it('should return 400 for missing file key', async () => {
      const response = await request(app)
        .post('/admin/import')
        .send({ accessToken: 'test-token' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'fileKey or fileUrl required');
    });

    it('should return 413 for too many screens', async () => {
      // Mock Figma response with too many frames
      const mockFigmaResponse = {
        data: {
          name: 'Large Prototype',
          document: {
            children: Array(15).fill().map((_, i) => ({
              id: `frame${i}`,
              type: 'FRAME',
              name: `Screen ${i + 1}`,
              absoluteBoundingBox: { x: 0, y: 0, width: 375, height: 812 },
              children: []
            }))
          }
        }
      };

      const mockAxios = require('axios');
      mockAxios.get.mockResolvedValue(mockFigmaResponse);

      const response = await request(app)
        .post('/admin/import')
        .send({
          fileKey: 'large-file-key',
          accessToken: 'test-token'
        })
        .expect(413);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Too many screens');
    });
  });

  describe('GET /admin/search', () => {
    it('should search prototypes', async () => {
      // Mock Pinecone search
      const mockPinecone = require('@pinecone-database/pinecone').Pinecone;
      const mockInstance = new mockPinecone();
      const mockIndex = mockInstance.index();
      const mockNamespace = mockIndex.namespace();
      
      mockNamespace.query.mockResolvedValue({
        matches: [
          {
            id: 'prototype-1',
            score: 0.95,
            metadata: {
              astSummary: 'Onboarding flow with 3 screens',
              screenCount: 3,
              importedBy: 'test-admin-id'
            }
          }
        ]
      });

      const response = await request(app)
        .get('/admin/search')
        .query({ q: 'onboarding flow' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('results');
      expect(response.body.results).toHaveLength(1);
    });

    it('should return 400 for missing query', async () => {
      const response = await request(app)
        .get('/admin/search')
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Query parameter is required');
    });
  });

  describe('GET /admin/prototypes', () => {
    it('should list imported prototypes', async () => {
      // Mock database query
      const mockPool = require('../models/database').pool;
      mockPool.query.mockResolvedValue({
        rows: [
          {
            id: 'prototype-1',
            file_key: 'test-file-1',
            name: 'Test Prototype 1',
            version: 1,
            validation: JSON.stringify({ score: 0.9 }),
            created_at: new Date(),
            imported_by: 'test-admin-id'
          }
        ]
      });

      const response = await request(app)
        .get('/admin/prototypes')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('prototypes');
      expect(response.body.prototypes).toHaveLength(1);
    });
  });
});

module.exports = app;
