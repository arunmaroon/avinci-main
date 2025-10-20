/**
 * Optimized Database Configuration
 * Features: Connection pooling, Redis caching, query optimization
 */

const { Pool } = require('pg');
const { Redis } = require('ioredis');
const { v4: uuidv4 } = require('uuid');

// Database connection pool with optimized settings
const pool = new Pool({
    user: process.env.DB_USER || 'avinci_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    
    // Connection pool settings
    max: 20, // Maximum number of clients in the pool
    min: 5,  // Minimum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
    
    // Query timeout
    query_timeout: 10000, // 10 seconds
    
    // SSL configuration
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    
    // Application name for monitoring
    application_name: 'avinci-backend'
});

// Redis client with optimized configuration
const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB || 0,
    
    // Connection settings
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    
    // Memory optimization
    maxMemoryPolicy: 'allkeys-lru',
    
    // Timeout settings
    connectTimeout: 10000,
    commandTimeout: 5000,
    
    // Keep alive
    keepAlive: 30000,
    
    // Retry strategy
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

// Cache configuration
const CACHE_TTL = {
    SHORT: 300,    // 5 minutes
    MEDIUM: 1800,  // 30 minutes
    LONG: 3600,    // 1 hour
    VERY_LONG: 86400 // 24 hours
};

// Optimized query functions with caching
const db = {
    // Basic query with optional caching
    async query(text, params = [], cacheKey = null, ttl = CACHE_TTL.MEDIUM) {
        try {
            // Check cache first
            if (cacheKey) {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    return JSON.parse(cached);
                }
            }

            // Execute query
            const start = Date.now();
            const result = await pool.query(text, params);
            const duration = Date.now() - start;

            // Log slow queries
            if (duration > 1000) {
                console.warn(`🐌 Slow query (${duration}ms):`, text.substring(0, 100));
            }

            // Cache result if cache key provided
            if (cacheKey && result.rows.length > 0) {
                await redis.setex(cacheKey, ttl, JSON.stringify(result));
            }

            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    },

    // Get single row with caching
    async getOne(text, params = [], cacheKey = null, ttl = CACHE_TTL.MEDIUM) {
        const result = await db.query(text, params, cacheKey, ttl);
        return result.rows[0] || null;
    },

    // Get multiple rows with caching
    async getMany(text, params = [], cacheKey = null, ttl = CACHE_TTL.MEDIUM) {
        const result = await db.query(text, params, cacheKey, ttl);
        return result.rows;
    },

    // Insert with return
    async insert(text, params = []) {
        const result = await pool.query(text, params);
        return result.rows[0];
    },

    // Update with return
    async update(text, params = []) {
        const result = await pool.query(text, params);
        return result.rows[0];
    },

    // Delete with return
    async delete(text, params = []) {
        const result = await pool.query(text, params);
        return result.rows[0];
    },

    // Transaction wrapper
    async transaction(callback) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
};

// Cache management functions
const cache = {
    // Set cache with TTL
    async set(key, value, ttl = CACHE_TTL.MEDIUM) {
        try {
            await redis.setex(key, ttl, JSON.stringify(value));
        } catch (error) {
            console.warn('Cache set error:', error.message);
        }
    },

    // Get from cache
    async get(key) {
        try {
            const value = await redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.warn('Cache get error:', error.message);
            return null;
        }
    },

    // Delete from cache
    async del(key) {
        try {
            await redis.del(key);
        } catch (error) {
            console.warn('Cache delete error:', error.message);
        }
    },

    // Delete multiple keys
    async delPattern(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (error) {
            console.warn('Cache pattern delete error:', error.message);
        }
    },

    // Clear all cache
    async clear() {
        try {
            await redis.flushdb();
        } catch (error) {
            console.warn('Cache clear error:', error.message);
        }
    }
};

// Database table creation with optimized indexes
async function createTables() {
    const client = await pool.connect();
    try {
        console.log('🔧 Creating optimized database tables...');

        // Create personas table with indexes
        await client.query(`
            CREATE TABLE IF NOT EXISTS personas (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID DEFAULT '00000000-0000-0000-0000-000000000000',
                name VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                company VARCHAR(255),
                location VARCHAR(255),
                avatar_url TEXT,
                age INTEGER,
                gender VARCHAR(50),
                education TEXT,
                income_range VARCHAR(100),
                family_status VARCHAR(100),
                occupation TEXT,
                industry TEXT,
                experience_years INTEGER,
                personality_archetype TEXT,
                big_five_traits JSONB,
                personality_adjectives TEXT[],
                values TEXT[],
                beliefs TEXT[],
                attitudes JSONB,
                primary_goals TEXT[],
                secondary_goals TEXT[],
                motivations TEXT[],
                aspirations TEXT[],
                fears TEXT[],
                concerns TEXT[],
                pain_points TEXT[],
                frustrations TEXT[],
                daily_routine JSONB,
                habits TEXT[],
                preferences JSONB,
                behaviors JSONB,
                lifestyle TEXT[],
                hobbies TEXT[],
                tech_savviness VARCHAR(50),
                preferred_devices TEXT[],
                apps_used TEXT[],
                tech_comfort_level JSONB,
                digital_behavior JSONB,
                communication_style JSONB,
                language_preferences JSONB,
                vocabulary_level VARCHAR(50),
                speech_patterns JSONB,
                emotional_profile JSONB,
                cognitive_style JSONB,
                learning_style VARCHAR(50),
                attention_span VARCHAR(50),
                social_context JSONB,
                cultural_background JSONB,
                social_media_usage JSONB,
                network_size VARCHAR(50),
                influence_level VARCHAR(50),
                life_events JSONB,
                current_situation JSONB,
                future_plans TEXT[],
                life_stage VARCHAR(50),
                financial_goals TEXT[],
                financial_concerns TEXT[],
                banking_preferences JSONB,
                investment_style VARCHAR(50),
                risk_tolerance VARCHAR(50),
                financial_literacy VARCHAR(50),
                persona_json JSONB,
                master_system_prompt TEXT,
                status VARCHAR(50) DEFAULT 'active',
                source_meta JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Create optimized indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_personas_user_id ON personas(user_id);
            CREATE INDEX IF NOT EXISTS idx_personas_status ON personas(status);
            CREATE INDEX IF NOT EXISTS idx_personas_created_at ON personas(created_at);
            CREATE INDEX IF NOT EXISTS idx_personas_name ON personas(name);
            CREATE INDEX IF NOT EXISTS idx_personas_company ON personas(company);
            CREATE INDEX IF NOT EXISTS idx_personas_occupation ON personas(occupation);
            CREATE INDEX IF NOT EXISTS idx_personas_tech_savviness ON personas(tech_savviness);
            CREATE INDEX IF NOT EXISTS idx_personas_primary_goals ON personas USING GIN(primary_goals);
            CREATE INDEX IF NOT EXISTS idx_personas_financial_goals ON personas USING GIN(financial_goals);
            CREATE INDEX IF NOT EXISTS idx_personas_personality_archetype ON personas(personality_archetype);
        `);

        // Create agents table with indexes
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_agents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                company VARCHAR(255),
                location VARCHAR(255),
                avatar_url TEXT,
                age INTEGER,
                gender VARCHAR(50),
                education TEXT,
                income_range VARCHAR(100),
                family_status VARCHAR(100),
                occupation TEXT,
                industry TEXT,
                experience_years INTEGER,
                personality_archetype TEXT,
                big_five_traits JSONB,
                personality_adjectives TEXT[],
                values TEXT[],
                beliefs TEXT[],
                attitudes JSONB,
                primary_goals TEXT[],
                secondary_goals TEXT[],
                motivations TEXT[],
                aspirations TEXT[],
                fears TEXT[],
                concerns TEXT[],
                pain_points TEXT[],
                frustrations TEXT[],
                daily_routine JSONB,
                habits TEXT[],
                preferences JSONB,
                behaviors JSONB,
                lifestyle TEXT[],
                hobbies TEXT[],
                tech_savviness VARCHAR(50),
                preferred_devices TEXT[],
                apps_used TEXT[],
                tech_comfort_level JSONB,
                digital_behavior JSONB,
                communication_style JSONB,
                language_preferences JSONB,
                vocabulary_level VARCHAR(50),
                speech_patterns JSONB,
                emotional_profile JSONB,
                cognitive_style JSONB,
                learning_style VARCHAR(50),
                attention_span VARCHAR(50),
                social_context JSONB,
                cultural_background JSONB,
                social_media_usage JSONB,
                network_size VARCHAR(50),
                influence_level VARCHAR(50),
                life_events JSONB,
                current_situation JSONB,
                future_plans TEXT[],
                life_stage VARCHAR(50),
                financial_goals TEXT[],
                financial_concerns TEXT[],
                banking_preferences JSONB,
                investment_style VARCHAR(50),
                risk_tolerance VARCHAR(50),
                financial_literacy VARCHAR(50),
                persona_json JSONB,
                master_system_prompt TEXT,
                status VARCHAR(50) DEFAULT 'active',
                source_meta JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Create agents indexes
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_agents_status ON ai_agents(status);
            CREATE INDEX IF NOT EXISTS idx_agents_created_at ON ai_agents(created_at);
            CREATE INDEX IF NOT EXISTS idx_agents_name ON ai_agents(name);
            CREATE INDEX IF NOT EXISTS idx_agents_company ON ai_agents(company);
            CREATE INDEX IF NOT EXISTS idx_agents_occupation ON ai_agents(occupation);
            CREATE INDEX IF NOT EXISTS idx_agents_tech_savviness ON ai_agents(tech_savviness);
            CREATE INDEX IF NOT EXISTS idx_agents_primary_goals ON ai_agents USING GIN(primary_goals);
            CREATE INDEX IF NOT EXISTS idx_agents_financial_goals ON ai_agents USING GIN(financial_goals);
            CREATE INDEX IF NOT EXISTS idx_agents_personality_archetype ON ai_agents(personality_archetype);
        `);

        console.log('✅ Database tables and indexes created successfully');

    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Health check function
async function healthCheck() {
    try {
        // Test database connection
        await pool.query('SELECT 1');
        
        // Test Redis connection
        await redis.ping();
        
        return {
            database: 'healthy',
            redis: 'healthy',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        return {
            database: 'unhealthy',
            redis: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = {
    pool,
    redis,
    db,
    cache,
    createTables,
    healthCheck,
    CACHE_TTL
};



