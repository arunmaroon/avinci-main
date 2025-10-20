# Sample Tests for Persona Image Integration

## Backend API Tests

### 1. Create Persona with Image
```bash
curl -X POST "http://localhost:9001/api/personas/v2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "personaData": {
      "name": "Abdul Yasser",
      "age": 35,
      "gender": "male",
      "ethnicity": "Indian",
      "occupation": "Fintech User",
      "location": "Hosur, Tamil Nadu",
      "industry": "Technology",
      "education": "Bachelor'\''s Degree",
      "tech_savviness": "Intermediate",
      "communication_style": {
        "tone": "professional",
        "formality": 6
      },
      "personality_archetype": "Analytical",
      "lifestyle": "Urban Professional"
    }
  }'
```

### 2. Regenerate Persona Image
```bash
curl -X PUT "http://localhost:9001/api/personas/v2/PERSONA_ID/regenerate-image" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Persona with Image
```bash
curl -X GET "http://localhost:9001/api/personas/v2/PERSONA_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Frontend React Tests

### 1. PersonaCard Component Test
```jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import OptimizedPersonaCard from '../components/OptimizedPersonaCard';
import usePersonaStore from '../stores/personaStore';

// Mock the store
jest.mock('../stores/personaStore');
jest.mock('react-hot-toast');

const mockPersona = {
  id: 'test-persona-1',
  name: 'Abdul Yasser',
  age: 35,
  gender: 'male',
  occupation: 'Fintech User',
  location: 'Hosur, Tamil Nadu',
  profile_image_url: 'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg',
  image_metadata: {
    photographer: 'John Doe',
    attribution: 'Via Pexels',
    source: 'pexels'
  }
};

describe('OptimizedPersonaCard', () => {
  const mockRegenerateImage = jest.fn();
  
  beforeEach(() => {
    usePersonaStore.mockReturnValue({
      regenerateImage: mockRegenerateImage
    });
  });

  test('renders persona with image', () => {
    render(<OptimizedPersonaCard persona={mockPersona} />);
    
    expect(screen.getByText('Abdul Yasser')).toBeInTheDocument();
    expect(screen.getByText('Fintech User')).toBeInTheDocument();
    expect(screen.getByText('Hosur, Tamil Nadu')).toBeInTheDocument();
    expect(screen.getByAltText('Abdul Yasser')).toBeInTheDocument();
  });

  test('shows image attribution', () => {
    render(<OptimizedPersonaCard persona={mockPersona} />);
    
    expect(screen.getByText('Via Pexels')).toBeInTheDocument();
  });

  test('handles image regeneration', async () => {
    mockRegenerateImage.mockResolvedValue({ success: true });
    
    render(<OptimizedPersonaCard persona={mockPersona} />);
    
    const regenerateButton = screen.getByTitle('Regenerate Image');
    fireEvent.click(regenerateButton);
    
    await waitFor(() => {
      expect(mockRegenerateImage).toHaveBeenCalledWith('test-persona-1');
    });
  });

  test('shows loading state during regeneration', async () => {
    mockRegenerateImage.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<OptimizedPersonaCard persona={mockPersona} />);
    
    const regenerateButton = screen.getByTitle('Regenerate Image');
    fireEvent.click(regenerateButton);
    
    expect(regenerateButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /regenerate image/i })).toHaveClass('animate-spin');
  });
});
```

### 2. PersonaStore Test
```jsx
import { renderHook, act } from '@testing-library/react';
import usePersonaStore from '../stores/personaStore';

// Mock API
jest.mock('../utils/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

describe('usePersonaStore', () => {
  beforeEach(() => {
    usePersonaStore.getState().reset();
  });

  test('regenerates image successfully', async () => {
    const { result } = renderHook(() => usePersonaStore());
    
    // Mock API response
    const mockImageData = {
      imageData: {
        url: 'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg',
        photographer: 'Jane Doe',
        attribution: 'Via Pexels'
      }
    };
    
    require('../utils/api').put.mockResolvedValue({
      data: { data: mockImageData }
    });
    
    await act(async () => {
      await result.current.regenerateImage('test-persona-1');
    });
    
    expect(require('../utils/api').put).toHaveBeenCalledWith(
      '/personas/v2/test-persona-1/regenerate-image'
    );
  });
});
```

## Python Tests

### 1. PersonaExtractor Test
```python
import pytest
from persona_extractor import PersonaExtractor

def test_build_image_search_query():
    extractor = PersonaExtractor()
    
    persona_data = {
        'name': 'Abdul Yasser',
        'age': 35,
        'gender': 'male',
        'ethnicity': 'Indian',
        'occupation': 'Fintech User',
        'location': 'Hosur, Tamil Nadu',
        'tech_savviness': 'Intermediate',
        'personality_archetype': 'Analytical'
    }
    
    query = extractor.build_image_search_query(persona_data)
    
    assert 'male' in query
    assert 'adult' in query
    assert 'indian' in query
    assert 'fintech user' in query
    assert 'hosur' in query
    assert 'realistic' in query
    assert 'professional' in query
    assert 'portrait' in query

def test_fetch_persona_image_with_pexels():
    extractor = PersonaExtractor()
    
    persona_data = {
        'name': 'Abdul Yasser',
        'age': 35,
        'gender': 'male',
        'ethnicity': 'Indian',
        'occupation': 'Fintech User',
        'location': 'Hosur, Tamil Nadu'
    }
    
    # Mock Pexels API response
    with patch('requests.get') as mock_get:
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'photos': [{
                'src': {'medium': 'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg'},
                'photographer': 'John Doe',
                'photographer_url': 'https://www.pexels.com/@johndoe',
                'url': 'https://www.pexels.com/photo/1234567/',
                'alt': 'Professional Indian man',
                'width': 400,
                'height': 400
            }]
        }
        mock_get.return_value = mock_response
        
        image_data = extractor.fetch_persona_image(persona_data)
        
        assert image_data['url'] == 'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg'
        assert image_data['photographer'] == 'John Doe'
        assert image_data['attribution'] == 'Via Pexels'
        assert image_data['source'] == 'pexels'

def test_fallback_image_generation():
    extractor = PersonaExtractor()
    
    persona_data = {
        'name': 'Abdul Yasser',
        'age': 35,
        'gender': 'male'
    }
    
    # Test without Pexels API key
    original_key = extractor.pexels_api_key
    extractor.pexels_api_key = None
    
    image_data = extractor.fetch_persona_image(persona_data)
    
    assert image_data['source'] in ['unsplash', 'ui-avatars']
    assert 'url' in image_data
    assert 'attribution' in image_data
    
    # Restore original key
    extractor.pexels_api_key = original_key

def test_extract_persona_with_image():
    extractor = PersonaExtractor()
    
    transcript = """
    Hi, I'm Abdul Yasser, a 35-year-old fintech user from Hosur, Tamil Nadu. 
    I work in technology and have been using digital banking services for the past 5 years.
    I prefer simple, user-friendly interfaces and value security in financial transactions.
    """
    
    with patch.object(extractor, 'fetch_persona_image') as mock_fetch:
        mock_fetch.return_value = {
            'url': 'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg',
            'photographer': 'John Doe',
            'attribution': 'Via Pexels',
            'source': 'pexels'
        }
        
        persona_data = extractor.extract_persona_with_image(transcript)
        
        assert 'profile_image_url' in persona_data
        assert 'image_metadata' in persona_data
        assert persona_data['profile_image_url'] == 'https://images.pexels.com/photos/1234567/pexels-photo-1234567.jpeg'
        assert persona_data['image_metadata']['attribution'] == 'Via Pexels'
```

## Integration Tests

### 1. End-to-End Persona Creation
```bash
#!/bin/bash

# Test complete persona creation flow
echo "Testing persona creation with image..."

# Create persona
RESPONSE=$(curl -s -X POST "http://localhost:9001/api/personas/v2" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "personaData": {
      "name": "Abdul Yasser",
      "age": 35,
      "gender": "male",
      "ethnicity": "Indian",
      "occupation": "Fintech User",
      "location": "Hosur, Tamil Nadu",
      "industry": "Technology",
      "tech_savviness": "Intermediate"
    }
  }')

echo "Persona creation response: $RESPONSE"

# Extract persona ID
PERSONA_ID=$(echo $RESPONSE | jq -r '.data.id')
echo "Created persona ID: $PERSONA_ID"

# Verify persona has image
curl -s -X GET "http://localhost:9001/api/personas/v2/$PERSONA_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" | jq '.data.profile_image_url'

echo "Test completed!"
```

### 2. Batch Processing Test
```python
# Test batch persona extraction with images
from persona_extractor import PersonaExtractor

extractor = PersonaExtractor()

transcripts = [
    {
        'id': 'transcript-1',
        'transcript': 'Hi, I\'m Abdul Yasser, a 35-year-old Indian fintech user from Hosur...',
        'demographics': {'location': 'Hosur, Tamil Nadu'}
    },
    {
        'id': 'transcript-2', 
        'transcript': 'Hello, I\'m Priya Sharma, a 28-year-old marketing manager from Mumbai...',
        'demographics': {'location': 'Mumbai, Maharashtra'}
    }
]

results = extractor.batch_extract_with_images(transcripts)

for result in results:
    if result['success']:
        print(f"✅ {result['transcript_id']}: {result['persona_data']['name']}")
        print(f"   Image: {result['persona_data']['profile_image_url']}")
        print(f"   Attribution: {result['persona_data']['image_metadata']['attribution']}")
    else:
        print(f"❌ {result['transcript_id']}: {result['error']}")
```

## Performance Tests

### 1. Image Caching Test
```python
import time
from persona_extractor import PersonaExtractor

extractor = PersonaExtractor()

persona_data = {
    'name': 'Test User',
    'age': 30,
    'gender': 'male',
    'occupation': 'Software Engineer'
}

# First request (should hit API)
start_time = time.time()
image1 = extractor.fetch_persona_image(persona_data)
first_request_time = time.time() - start_time

# Second request (should hit cache)
start_time = time.time()
image2 = extractor.fetch_persona_image(persona_data)
second_request_time = time.time() - start_time

print(f"First request time: {first_request_time:.2f}s")
print(f"Second request time: {second_request_time:.2f}s")
print(f"Cache speedup: {first_request_time/second_request_time:.1f}x")
```

## Error Handling Tests

### 1. API Failure Handling
```python
def test_pexels_api_failure():
    extractor = PersonaExtractor()
    
    # Mock API failure
    with patch('requests.get') as mock_get:
        mock_get.side_effect = Exception("API Error")
        
        image_data = extractor.fetch_persona_image({'name': 'Test'})
        
        # Should return fallback image
        assert image_data['source'] in ['unsplash', 'ui-avatars']
        assert 'url' in image_data
```

### 2. Network Timeout Handling
```python
def test_network_timeout():
    extractor = PersonaExtractor()
    
    with patch('requests.get') as mock_get:
        mock_get.side_effect = requests.Timeout("Request timed out")
        
        image_data = extractor.fetch_persona_image({'name': 'Test'})
        
        # Should return fallback image
        assert image_data['source'] in ['unsplash', 'ui-avatars']
```
