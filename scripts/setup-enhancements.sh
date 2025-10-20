#!/bin/bash

# Avinci Enhancement Setup Script
# This script sets up the enhanced persona system with all new features

set -e

echo "🚀 Setting up Avinci Enhancements..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# 1. Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install

# Install new dependencies for enhanced features
print_status "Installing new backend dependencies..."
npm install --save \
    jsonwebtoken \
    bcryptjs \
    redis \
    @pinecone-database/pinecone \
    @anthropic-ai/sdk

cd ..

# 2. Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install

# Install new frontend dependencies
print_status "Installing new frontend dependencies..."
npm install --save \
    zustand \
    @heroicons/react \
    framer-motion \
    axios

cd ..

# 3. Install Python dependencies
print_status "Installing Python dependencies..."
cd data-processing
pip install -r requirements.txt

# Download spaCy model
print_status "Downloading spaCy English model..."
python -m spacy download en_core_web_sm

# Download NLTK data
print_status "Downloading NLTK data..."
python -c "import nltk; nltk.download('punkt'); nltk.download('vader_lexicon'); nltk.download('averaged_perceptron_tagger'); nltk.download('maxent_ne_chunker'); nltk.download('words')"

cd ..

# 4. Set up environment variables
print_status "Setting up environment variables..."
if [ ! -f ".env" ]; then
    print_warning "Creating .env file from template..."
    cp env.example .env
    print_warning "Please update .env with your actual API keys and configuration"
else
    print_warning ".env file already exists. Please ensure it has all required variables."
fi

# 5. Run database migrations
print_status "Running database migrations..."
cd backend

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    print_error "PostgreSQL is not running. Please start PostgreSQL first."
    exit 1
fi

# Run the new migration
print_status "Applying comprehensive persona schema migration..."
psql -h localhost -U avinci_admin -d avinci -f migrations/010_comprehensive_persona_schema_v2.sql

cd ..

# 6. Set up Redis
print_status "Checking Redis connection..."
if ! redis-cli ping > /dev/null 2>&1; then
    print_warning "Redis is not running. Please start Redis for caching features."
    print_warning "You can start Redis with: redis-server"
else
    print_success "Redis is running and ready for caching."
fi

# 7. Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/logs
mkdir -p data-processing/data
mkdir -p data-processing/logs
mkdir -p monitoring

# 8. Set up Git branch for enhancements
print_status "Setting up Git branch for enhancements..."
if git branch | grep -q "feat/enhancements"; then
    print_warning "feat/enhancements branch already exists"
else
    git checkout -b feat/enhancements
    print_success "Created feat/enhancements branch"
fi

# 9. Run tests
print_status "Running tests..."
cd backend
if command -v npm test > /dev/null 2>&1; then
    npm test
    print_success "Backend tests passed"
else
    print_warning "No test script found in backend package.json"
fi
cd ..

# 10. Build frontend
print_status "Building frontend..."
cd frontend
if command -v npm run build > /dev/null 2>&1; then
    npm run build
    print_success "Frontend built successfully"
else
    print_warning "No build script found in frontend package.json"
fi
cd ..

# 11. Create sample data
print_status "Creating sample persona data..."
cd backend
node -e "
const PersonaManager = require('./agents/personaManager');
const personaManager = new PersonaManager();

const samplePersona = {
  name: 'Aditya Singh',
  title: 'Business Analyst',
  company: 'TechCorp',
  location: 'Delhi, NCR',
  age: 33,
  gender: 'Male',
  education: 'B.Tech + MBA',
  personality_archetype: 'Analytical',
  primary_goals: ['Career advancement', 'Financial planning', 'Skill development'],
  pain_points: ['Complex interfaces', 'Slow processes', 'Lack of transparency'],
  tech_savviness: 'Advanced',
  financial_goals: ['Home loan', 'Investment planning', 'Emergency fund'],
  communication_style: { formality: 'medium', tone: 'professional' },
  values: ['Honesty', 'Efficiency', 'Quality', 'Innovation'],
  hobbies: ['Reading', 'Cricket', 'Travel'],
  daily_routine: {
    morning: '6 AM - Exercise and breakfast',
    afternoon: 'Work and meetings',
    evening: 'Family time and relaxation'
  }
};

personaManager.createPersona('00000000-0000-0000-0000-000000000000', samplePersona, {
  source_type: 'setup_script',
  created_at: new Date().toISOString()
}).then(result => {
  console.log('✅ Sample persona created:', result.name);
  process.exit(0);
}).catch(error => {
  console.error('❌ Error creating sample persona:', error.message);
  process.exit(1);
});
"

cd ..

print_success "🎉 Avinci Enhancements setup complete!"
print_status "Next steps:"
echo "1. Update .env file with your API keys"
echo "2. Start the backend: cd backend && npm run dev"
echo "3. Start the frontend: cd frontend && npm start"
echo "4. Start Redis: redis-server"
echo "5. Access the application at http://localhost:9000"
echo ""
print_status "New features available:"
echo "✅ Comprehensive persona management with 51 UXPressia fields"
echo "✅ Persistent storage with PostgreSQL and Redis caching"
echo "✅ Modular backend architecture"
echo "✅ Enhanced frontend with Zustand state management"
echo "✅ Python data processing for transcript analysis"
echo "✅ JWT authentication and security"
echo "✅ Vector search capabilities"
echo "✅ Docker production deployment"
echo "✅ Comprehensive test suite"
echo ""
print_success "Happy coding! 🚀"



