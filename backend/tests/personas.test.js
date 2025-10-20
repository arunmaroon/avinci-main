/**
 * Personas API Tests
 * Comprehensive test suite for persona management endpoints
 */

const request = require('supertest');
const express = require('express');
const { Pool } = require('pg');
const personasRouter = require('../routes/personas_v2');
const auth = require('../middleware/auth');

// Mock database
const mockPool = {
  query: jest.fn(),
  connect: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn()
  })),
  end: jest.fn()
};

// Mock PersonaManager
jest.mock('../agents/personaManager', () => {
  return jest.fn().mockImplementation(() => ({
    createPersona: jest.fn(),
    getPersona: jest.fn(),
    getPersonas: jest.fn(),
    updatePersona: jest.fn(),
    deletePersona: jest.fn(),
    searchPersonas: jest.fn(),
    close: jest.fn()
  }));
});

// Mock AgentGeneration
jest.mock('../agents/generation', () => {
  return jest.fn().mockImplementation(() => ({
    analyzeTranscript: jest.fn(),
    synthesizePersona: jest.fn(),
    generateMasterPrompt: jest.fn(),
    generateAvatarUrl: jest.fn(),
    batchProcessTranscripts: jest.fn(),
    clusterPersonas: jest.fn(),
    generatePersonaInsights: jest.fn()
  }));
});

// Create test app
const app = express();
app.use(express.json());
app.use('/api/personas/v2', personasRouter);

// Mock auth middleware
app.use((req, res, next) => {
  req.user = {
    id: 'test-user-id',
    email: 'test@example.com',
    role: 'admin'
  };
  next();
});

describe('Personas API v2', () => {
  let personaManager;
  let agentGeneration;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get mocked instances
    const PersonaManager = require('../agents/personaManager');
    const AgentGeneration = require('../agents/generation');
    
    personaManager = new PersonaManager();
    agentGeneration = new AgentGeneration();
  });

  describe('POST /api/personas/v2', () => {
    it('should create a persona from transcript', async () => {
      const transcript = 'I am John Doe, a 30-year-old software engineer...';
      const demographics = { age: 30, gender: 'Male' };
      
      const mockPersona = {
        id: 'persona-123',
        name: 'John Doe',
        age: 30,
        gender: 'Male',
        occupation: 'Software Engineer'
      };

      agentGeneration.analyzeTranscript.mockResolvedValue({ personality: 'analytical' });
      agentGeneration.synthesizePersona.mockResolvedValue(mockPersona);
      agentGeneration.generateMasterPrompt.mockResolvedValue('You are John Doe...');
      agentGeneration.generateAvatarUrl.mockReturnValue('https://example.com/avatar.jpg');
      personaManager.createPersona.mockResolvedValue(mockPersona);

      const response = await request(app)
        .post('/api/personas/v2')
        .send({
          transcript,
          demographics
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPersona);
      expect(agentGeneration.analyzeTranscript).toHaveBeenCalledWith(transcript, demographics);
      expect(personaManager.createPersona).toHaveBeenCalled();
    });

    it('should create a persona from manual data', async () => {
      const personaData = {
        name: 'Jane Smith',
        age: 25,
        gender: 'Female',
        occupation: 'Designer'
      };

      const mockPersona = { id: 'persona-456', ...personaData };
      personaManager.createPersona.mockResolvedValue(mockPersona);

      const response = await request(app)
        .post('/api/personas/v2')
        .send({
          personaData
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPersona);
      expect(personaManager.createPersona).toHaveBeenCalledWith(
        'test-user-id',
        personaData,
        expect.objectContaining({ source_type: 'manual' })
      );
    });

    it('should return 400 if neither transcript nor personaData provided', async () => {
      const response = await request(app)
        .post('/api/personas/v2')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Either transcript or personaData is required');
    });

    it('should handle creation errors', async () => {
      personaManager.createPersona.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/personas/v2')
        .send({
          personaData: { name: 'Test' }
        })
        .expect(500);

      expect(response.body.error).toBe('Failed to create persona');
    });
  });

  describe('GET /api/personas/v2', () => {
    it('should fetch personas with pagination', async () => {
      const mockPersonas = [
        { id: '1', name: 'Persona 1' },
        { id: '2', name: 'Persona 2' }
      ];
      const mockPagination = {
        page: 1,
        limit: 20,
        total: 2,
        pages: 1
      };

      personaManager.getPersonas.mockResolvedValue({
        personas: mockPersonas,
        pagination: mockPagination
      });

      const response = await request(app)
        .get('/api/personas/v2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPersonas);
      expect(response.body.pagination).toEqual(mockPagination);
      expect(personaManager.getPersonas).toHaveBeenCalledWith('test-user-id', {
        page: 1,
        limit: 20,
        status: 'active',
        search: '',
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
    });

    it('should handle query parameters', async () => {
      personaManager.getPersonas.mockResolvedValue({
        personas: [],
        pagination: { page: 2, limit: 10, total: 0, pages: 0 }
      });

      await request(app)
        .get('/api/personas/v2?page=2&limit=10&search=test&status=archived')
        .expect(200);

      expect(personaManager.getPersonas).toHaveBeenCalledWith('test-user-id', {
        page: 2,
        limit: 10,
        status: 'archived',
        search: 'test',
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });
    });
  });

  describe('GET /api/personas/v2/:id', () => {
    it('should fetch a specific persona', async () => {
      const mockPersona = {
        id: 'persona-123',
        name: 'John Doe',
        age: 30
      };

      personaManager.getPersona.mockResolvedValue(mockPersona);

      const response = await request(app)
        .get('/api/personas/v2/persona-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockPersona);
      expect(personaManager.getPersona).toHaveBeenCalledWith('persona-123', 'test-user-id');
    });

    it('should return 404 if persona not found', async () => {
      personaManager.getPersona.mockRejectedValue(new Error('Persona not found'));

      const response = await request(app)
        .get('/api/personas/v2/nonexistent')
        .expect(404);

      expect(response.body.error).toBe('Persona not found');
    });
  });

  describe('PUT /api/personas/v2/:id', () => {
    it('should update a persona', async () => {
      const updateData = { name: 'Updated Name' };
      const mockUpdatedPersona = {
        id: 'persona-123',
        name: 'Updated Name',
        age: 30
      };

      personaManager.updatePersona.mockResolvedValue(mockUpdatedPersona);

      const response = await request(app)
        .put('/api/personas/v2/persona-123')
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUpdatedPersona);
      expect(personaManager.updatePersona).toHaveBeenCalledWith(
        'persona-123',
        'test-user-id',
        updateData
      );
    });

    it('should return 404 if persona not found', async () => {
      personaManager.updatePersona.mockRejectedValue(new Error('Persona not found or access denied'));

      const response = await request(app)
        .put('/api/personas/v2/nonexistent')
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.error).toBe('Persona not found or access denied');
    });
  });

  describe('DELETE /api/personas/v2/:id', () => {
    it('should delete a persona', async () => {
      const mockDeletedPersona = {
        id: 'persona-123',
        name: 'John Doe'
      };

      personaManager.deletePersona.mockResolvedValue(mockDeletedPersona);

      const response = await request(app)
        .delete('/api/personas/v2/persona-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockDeletedPersona);
      expect(personaManager.deletePersona).toHaveBeenCalledWith('persona-123', 'test-user-id');
    });
  });

  describe('POST /api/personas/v2/search', () => {
    it('should search personas by semantic similarity', async () => {
      const searchQuery = 'software engineer';
      const mockResults = [
        { id: '1', name: 'John Doe', distance: 0.1 },
        { id: '2', name: 'Jane Smith', distance: 0.2 }
      ];

      personaManager.searchPersonas.mockResolvedValue(mockResults);

      const response = await request(app)
        .post('/api/personas/v2/search')
        .send({ query: searchQuery })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockResults);
      expect(response.body.query).toBe(searchQuery);
      expect(personaManager.searchPersonas).toHaveBeenCalledWith('test-user-id', searchQuery, 10);
    });

    it('should return 400 if no query provided', async () => {
      const response = await request(app)
        .post('/api/personas/v2/search')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Search query is required');
    });
  });

  describe('POST /api/personas/v2/batch', () => {
    it('should process multiple transcripts', async () => {
      const transcripts = [
        { text: 'Transcript 1', demographics: {} },
        { text: 'Transcript 2', demographics: {} }
      ];

      const mockResults = {
        total_processed: 2,
        successful: 2,
        failed: 0,
        personas: [
          { id: '1', name: 'Persona 1' },
          { id: '2', name: 'Persona 2' }
        ]
      };

      agentGeneration.batchProcessTranscripts.mockResolvedValue([
        { transcript_id: '1', persona_data: { name: 'Persona 1' }, success: true },
        { transcript_id: '2', persona_data: { name: 'Persona 2' }, success: true }
      ]);

      personaManager.createPersona
        .mockResolvedValueOnce({ id: '1', name: 'Persona 1' })
        .mockResolvedValueOnce({ id: '2', name: 'Persona 2' });

      const response = await request(app)
        .post('/api/personas/v2/batch')
        .send({ transcripts })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total_processed).toBe(2);
      expect(agentGeneration.batchProcessTranscripts).toHaveBeenCalledWith(transcripts, {});
    });
  });

  describe('GET /api/personas/v2/analytics/insights', () => {
    it('should fetch persona analytics', async () => {
      const mockInsights = {
        total_personas: 10,
        age_distribution: { '20-30': 5, '30-40': 5 },
        gender_distribution: { 'Male': 6, 'Female': 4 }
      };

      personaManager.getPersonas.mockResolvedValue({
        personas: Array(10).fill({}),
        pagination: { page: 1, limit: 1000, total: 10, pages: 1 }
      });

      agentGeneration.generatePersonaInsights.mockResolvedValue(mockInsights);

      const response = await request(app)
        .get('/api/personas/v2/analytics/insights')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockInsights);
    });
  });

  describe('POST /api/personas/v2/cluster', () => {
    it('should cluster personas by similarity', async () => {
      const mockClusters = {
        'tech_experts': [{ id: '1', name: 'Expert 1' }],
        'tech_intermediate': [{ id: '2', name: 'Intermediate 1' }],
        'tech_beginners': [{ id: '3', name: 'Beginner 1' }]
      };

      personaManager.getPersonas.mockResolvedValue({
        personas: Array(3).fill({}),
        pagination: { page: 1, limit: 1000, total: 3, pages: 1 }
      });

      agentGeneration.clusterPersonas.mockResolvedValue(mockClusters);

      const response = await request(app)
        .post('/api/personas/v2/cluster')
        .send({ numClusters: 3 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockClusters);
    });
  });
});



