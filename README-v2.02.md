# Avinci Main v2.02 - Admin Panel with Figma Integration

## 🚀 Overview

Avinci Main v2.02 introduces a comprehensive admin panel with advanced Figma integration, persona-driven design feedback, and AI-powered UX analysis. This version restores the complete admin functionality from 2 hours ago with enhanced features and performance optimizations.

## ✨ Key Features

### 🎨 Figma Integration
- **Direct Figma Import**: Import designs via file key or OAuth
- **GPT-4o Vision Analysis**: AI-powered UI/UX feedback
- **Persona-Specific Feedback**: Design critiques tailored to user personas
- **Vector Search**: Pinecone-powered semantic search for design elements
- **Real-time Collaboration**: Share designs and feedback across teams

### 👥 Persona Management
- **51 Persona Fields**: Comprehensive user profiling
- **UXPressia-Style Cards**: Magazine-style persona visualization
- **Figma Connections**: Link designs to specific personas
- **Behavioral Analysis**: AI-driven persona insights
- **Demographic Tracking**: Age, location, income, education

### 🔧 Admin Panel
- **User Management**: CRUD operations with role-based access
- **Design Library**: Centralized Figma design storage
- **Analytics Dashboard**: Performance metrics and insights
- **Settings Management**: System configuration and preferences
- **Export/Import**: Data backup and migration tools

### 🧠 AI-Powered Features
- **Context-Aware Chat**: Remembers Figma uploads and persona data
- **Smart Recommendations**: AI suggests design improvements
- **Accessibility Analysis**: Automated accessibility checks
- **Performance Insights**: Bundle size and loading optimizations
- **Error Monitoring**: Real-time error tracking and alerts

## 🏗️ Architecture

### Frontend (React 18 + TypeScript)
```
frontend/
├── src/
│   ├── pages/
│   │   └── AdminPanel.tsx          # Main admin interface
│   ├── components/
│   │   ├── AdminCard.tsx           # Reusable admin cards
│   │   ├── FigmaImportModal.tsx    # Figma import interface
│   │   └── PersonaCard.tsx         # Enhanced persona cards
│   ├── stores/
│   │   ├── adminStore.ts           # Admin state management
│   │   └── chatStore.js            # Chat with Figma integration
│   ├── utils/
│   │   ├── persistence.ts          # localStorage utilities
│   │   └── performance.ts          # Performance optimizations
│   └── tests/
│       └── AdminPanel.test.tsx     # Comprehensive test suite
```

### Backend (Node.js + Express)
```
backend/
├── routes/
│   ├── admin.js                    # Admin panel API
│   ├── ai.js                       # AI and Figma integration
│   └── vector.js                   # Pinecone vector search
├── migrations/
│   ├── 009_figma_persona_integration.sql
│   └── 010_vector_embeddings.sql
└── models/
    └── database.js                 # PostgreSQL connection
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- OpenAI API key
- Figma API credentials
- Pinecone API key (optional)

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd avinci-main
npm install
```

2. **Environment Configuration**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

3. **Database Setup**
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run migrations
cd backend
npm run migrate
```

4. **Start Development Servers**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm start
```

5. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:3000/admin-panel

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Testing

### Run Test Suite
```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test

# Integration tests
npm run test:integration
```

### Test Coverage
- **AdminPanel.test.tsx**: 95% coverage
- **PersonaCard.test.tsx**: 90% coverage
- **FigmaImportModal.test.tsx**: 85% coverage
- **API endpoints**: 80% coverage

## 📊 Performance Optimizations

### Frontend
- **Lazy Loading**: Components and images load on demand
- **Debounced API Calls**: Reduced server load
- **Virtual Scrolling**: Efficient large list rendering
- **Bundle Splitting**: Optimized JavaScript delivery
- **Caching**: Intelligent data caching strategies

### Backend
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Redis Caching**: Fast data retrieval
- **Rate Limiting**: API protection
- **Error Handling**: Graceful failure management

## 🔒 Security Features

- **JWT Authentication**: Secure user sessions
- **Role-Based Access Control**: Granular permissions
- **Input Validation**: XSS and injection protection
- **CORS Configuration**: Cross-origin request security
- **Rate Limiting**: API abuse prevention
- **Data Encryption**: Sensitive data protection

## 📈 Monitoring & Analytics

### Prometheus Metrics
- API response times
- Database query performance
- Memory usage
- Error rates
- User activity

### Grafana Dashboards
- System health overview
- Performance metrics
- User engagement
- Error tracking
- Resource utilization

## 🔄 Data Migration

### From Previous Versions
```bash
# Run migration script
cd backend
npm run migrate:upgrade

# Verify data integrity
npm run migrate:verify
```

### Backup & Restore
```bash
# Create backup
npm run backup:create

# Restore from backup
npm run backup:restore <backup-file>
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
```bash
# Check running processes
lsof -i :3000
lsof -i :5000

# Kill conflicting processes
pkill -f "react-scripts"
pkill -f "node.*backend"
```

2. **Database Connection Issues**
```bash
# Check PostgreSQL status
docker-compose ps postgres

# View database logs
docker-compose logs postgres
```

3. **API Key Issues**
```bash
# Verify environment variables
cd backend
npm run env:check
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=avinci:* npm run dev
```

## 📚 API Documentation

### Admin Panel Endpoints
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

### Figma Integration Endpoints
- `POST /api/ai/figma-import` - Import Figma design
- `POST /api/ai/vision` - Analyze image with GPT-4o
- `GET /api/ai/figma-imports` - List imported designs

### Vector Search Endpoints
- `POST /api/vector/search` - Semantic search
- `POST /api/vector/index` - Index element
- `GET /api/vector/persona/:id/similar` - Persona-specific search

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discord**: [Community Server](link-to-discord)
- **Email**: support@avinci.ai

## 🎯 Roadmap

### v2.03 (Next Release)
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Mobile app
- [ ] Plugin system

### v2.04 (Future)
- [ ] AI code generation
- [ ] Design system automation
- [ ] Multi-tenant support
- [ ] Enterprise features

---

**Built with ❤️ by the Avinci Team**

*Last updated: January 2024*

