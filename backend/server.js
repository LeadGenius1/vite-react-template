const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { generateToken, hashPassword, verifyPassword, authMiddleware } = require('./auth/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
const getAllowedOrigins = () => {
  if (process.env.ALLOWED_ORIGINS) {
    return process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }
  // Default origins for development
  return ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://127.0.0.1:8080'];
};

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = getAllowedOrigins();
    
    // In development, allow all origins
    // In production, restrict to specific domains
    if (process.env.NODE_ENV === 'production') {
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Development mode: allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Serve static files if they exist
if (require('fs').existsSync('../frontend')) {
  app.use(express.static('../frontend'));
}

// In-memory user store (replace with database in production)
const users = new Map();

// Root endpoint - some platforms check this
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'AI Lead Strategies Backend API',
    status: 'running',
    health: '/health',
    api: '/api/status'
  });
});

// Health check - compatible with various cloud platforms
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ai-lead-strategies-backend',
    version: '1.0.0'
  });
});

// Alternative health check endpoints for different platforms
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/_health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// AWS specific health check
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Mock API endpoints
app.get('/api/status', (req, res) => {
  res.json({ message: 'AI Lead Strategies API is running!', platforms: ['tackle', 'social-syncs', 'videosite', 'lead-genius'] });
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, id } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        code: 'missing_required_fields' 
      });
    }
    
    // Check if user with this email already exists
    if (users.has(email)) {
      return res.status(409).json({ 
        error: 'A user with this ID or email already exists',
        code: 'already_exists',
        endpoint: 'create',
        service: 'user'
      });
    }
    
    // Check if a user ID was provided and if it's already taken
    const userId = id || Date.now().toString();
    const existingUserWithId = Array.from(users.values()).find(u => u.id === userId);
    if (existingUserWithId) {
      return res.status(409).json({ 
        error: 'A user with this ID or email already exists',
        code: 'already_exists',
        endpoint: 'create',
        service: 'user'
      });
    }
    
    const hashedPassword = await hashPassword(password);
    
    users.set(email, {
      id: userId,
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });
    
    const token = generateToken(userId, email);
    
    console.log(`User registered successfully: ${email} (ID: ${userId})`);
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, email, name: name || email.split('@')[0] }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      code: 'internal_error',
      service: 'user'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = users.get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = generateToken(user.id, email);
    
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected route example
app.get('/api/user/profile', authMiddleware, (req, res) => {
  const user = users.get(req.user.email);
  if (user) {
    res.json({
      id: user.id,
      email: user.email,
      name: user.name
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

// Check if user exists (for debugging)
app.get('/api/auth/check/:email', (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const exists = users.has(email);
  res.json({ 
    exists,
    email,
    service: 'user'
  });
});

// List all users (for debugging - remove in production)
app.get('/api/debug/users', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Forbidden in production' });
  }
  
  const userList = Array.from(users.values()).map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt
  }));
  
  res.json({
    count: userList.length,
    users: userList
  });
});

// Clear all users (for debugging - remove in production)
app.delete('/api/debug/users', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Forbidden in production' });
  }
  
  const count = users.size;
  users.clear();
  
  res.json({
    message: `Cleared ${count} users`,
    service: 'user'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n========================================');
  console.log('🚀 AI Lead Strategies API Server Started');
  console.log('========================================');
  console.log(`📍 Server running on: http://0.0.0.0:${PORT}`);
  console.log(`📍 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📍 API Status: http://0.0.0.0:${PORT}/api/status`);
  console.log('========================================\n');
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
