#!/bin/bash

# Avinci Main v2.02 Setup Script
# Complete setup for admin panel with Figma integration

set -e

echo "🚀 Setting up Avinci Main v2.02 with Admin Panel & Figma Integration"
echo "=================================================================="

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

# Check if running from correct directory
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Please run this script from the avinci-main root directory"
    exit 1
fi

# Check Node.js version
print_status "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js version: $(node -v)"

# Check if Docker is available
print_status "Checking Docker availability..."
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    print_success "Docker and Docker Compose are available"
    DOCKER_AVAILABLE=true
else
    print_warning "Docker not available. Will use local services instead."
    DOCKER_AVAILABLE=false
fi

# Install dependencies
print_status "Installing dependencies..."

# Backend dependencies
print_status "Installing backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    print_error "Backend package.json not found"
    exit 1
fi

npm install
print_success "Backend dependencies installed"

# Frontend dependencies
print_status "Installing frontend dependencies..."
cd ../frontend
if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found"
    exit 1
fi

npm install
print_success "Frontend dependencies installed"

cd ..

# Create environment files
print_status "Creating environment files..."

# Backend .env
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# Database Configuration
DATABASE_URL=postgresql://avinci:avinci_password@localhost:5432/avinci
DB_HOST=localhost
DB_PORT=5432
DB_NAME=avinci
DB_USER=avinci
DB_PASSWORD=avinci_password

# Redis Configuration
REDIS_URL=redis://localhost:6379

# API Keys (Replace with your actual keys)
OPENAI_API_KEY=your_openai_api_key_here
FIGMA_CLIENT_ID=your_figma_client_id_here
FIGMA_CLIENT_SECRET=your_figma_client_secret_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=avinci-figma-personas

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    print_success "Backend .env file created"
else
    print_warning "Backend .env file already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOF
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_VERSION=2.02

# Feature Flags
REACT_APP_ENABLE_FIGMA_INTEGRATION=true
REACT_APP_ENABLE_PERSONA_ANALYSIS=true
REACT_APP_ENABLE_VECTOR_SEARCH=true

# Development
GENERATE_SOURCEMAP=false
EOF
    print_success "Frontend .env file created"
else
    print_warning "Frontend .env file already exists"
fi

# Setup database
print_status "Setting up database..."

if [ "$DOCKER_AVAILABLE" = true ]; then
    print_status "Starting PostgreSQL with Docker..."
    docker-compose up -d postgres redis
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 10
    
    # Run migrations
    print_status "Running database migrations..."
    cd backend
    npm run migrate || {
        print_warning "Migration failed, trying to create database manually..."
        # Create database if it doesn't exist
        docker exec avinci-postgres psql -U avinci -c "CREATE DATABASE avinci;" || true
        npm run migrate
    }
    cd ..
    print_success "Database setup complete"
else
    print_warning "Docker not available. Please set up PostgreSQL and Redis manually."
    print_status "Database URL: postgresql://avinci:avinci_password@localhost:5432/avinci"
    print_status "Redis URL: redis://localhost:6379"
fi

# Run tests
print_status "Running tests..."

# Frontend tests
print_status "Running frontend tests..."
cd frontend
if npm test -- --watchAll=false --passWithNoTests; then
    print_success "Frontend tests passed"
else
    print_warning "Some frontend tests failed, but continuing..."
fi
cd ..

# Backend tests
print_status "Running backend tests..."
cd backend
if npm test; then
    print_success "Backend tests passed"
else
    print_warning "Some backend tests failed, but continuing..."
fi
cd ..

# Build frontend
print_status "Building frontend..."
cd frontend
npm run build
print_success "Frontend build complete"
cd ..

# Create startup scripts
print_status "Creating startup scripts..."

# Development startup script
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Avinci Main v2.02 Development Servers"
echo "================================================"

# Start backend
echo "Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 10

echo "✅ Development servers started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "Admin Panel: http://localhost:3000/admin-panel"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
EOF

chmod +x start-dev.sh
print_success "Development startup script created"

# Production startup script
cat > start-prod.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Avinci Main v2.02 Production"
echo "======================================="

# Start with Docker Compose
docker-compose up -d

echo "✅ Production services started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "Admin Panel: http://localhost:3000/admin-panel"
echo "Grafana: http://localhost:3001"
echo "Prometheus: http://localhost:9090"
EOF

chmod +x start-prod.sh
print_success "Production startup script created"

# Create health check script
cat > health-check.sh << 'EOF'
#!/bin/bash
echo "🔍 Checking Avinci Main v2.02 Health"
echo "==================================="

# Check backend
echo "Checking backend..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend is not responding"
fi

# Check frontend
echo "Checking frontend..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "❌ Frontend is not responding"
fi

# Check database
echo "Checking database..."
if docker exec avinci-postgres pg_isready -U avinci > /dev/null 2>&1; then
    echo "✅ Database is healthy"
else
    echo "❌ Database is not responding"
fi

# Check Redis
echo "Checking Redis..."
if docker exec avinci-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is healthy"
else
    echo "❌ Redis is not responding"
fi
EOF

chmod +x health-check.sh
print_success "Health check script created"

# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
echo "💾 Creating Avinci Main v2.02 Backup"
echo "==================================="

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup database
echo "Backing up database..."
docker exec avinci-postgres pg_dump -U avinci avinci > "$BACKUP_DIR/database.sql"

# Backup uploaded files
echo "Backing up uploaded files..."
if [ -d "backend/uploads" ]; then
    cp -r backend/uploads "$BACKUP_DIR/"
fi

# Backup configuration
echo "Backing up configuration..."
cp backend/.env "$BACKUP_DIR/backend.env" 2>/dev/null || true
cp frontend/.env "$BACKUP_DIR/frontend.env" 2>/dev/null || true

# Create archive
echo "Creating backup archive..."
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .
rm -rf "$BACKUP_DIR"

echo "✅ Backup created: $BACKUP_DIR.tar.gz"
EOF

chmod +x backup.sh
print_success "Backup script created"

# Final setup summary
echo ""
echo "🎉 Avinci Main v2.02 Setup Complete!"
echo "===================================="
echo ""
echo "📁 Project Structure:"
echo "  ├── frontend/          # React 18 + TypeScript"
echo "  ├── backend/           # Node.js + Express"
echo "  ├── nginx/             # Reverse proxy config"
echo "  ├── monitoring/        # Prometheus + Grafana"
echo "  └── docker-compose.yml # Container orchestration"
echo ""
echo "🚀 Quick Start:"
echo "  Development: ./start-dev.sh"
echo "  Production:  ./start-prod.sh"
echo "  Health Check: ./health-check.sh"
echo "  Backup:      ./backup.sh"
echo ""
echo "🌐 Access Points:"
echo "  Frontend:     http://localhost:3000"
echo "  Backend API:  http://localhost:5000"
echo "  Admin Panel:  http://localhost:3000/admin-panel"
echo "  Grafana:      http://localhost:3001"
echo "  Prometheus:   http://localhost:9090"
echo ""
echo "🔧 Configuration:"
echo "  Backend:  backend/.env"
echo "  Frontend: frontend/.env"
echo ""
echo "📚 Documentation:"
echo "  README: README-v2.02.md"
echo "  API Docs: http://localhost:5000/api-docs"
echo ""
echo "⚠️  Next Steps:"
echo "  1. Update API keys in backend/.env"
echo "  2. Configure Figma credentials"
echo "  3. Set up Pinecone index (optional)"
echo "  4. Run ./start-dev.sh to begin development"
echo ""
echo "Happy coding! 🚀"

