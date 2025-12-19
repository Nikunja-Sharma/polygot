/**
 * Node.js API Gateway (Pet Brain)
 * Central orchestrator that aggregates data from all microservices
 * and calculates pet mood based on system health.
 */

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Service URLs (using docker-compose service names)
const SERVICES = {
  metrics: 'http://metrics:8000',
  validator: 'http://validator:8001',
  load: 'http://load:8002',
  chaos: 'http://chaos:8003',
  rules: 'http://rules:8080'
};

// Axios instance with 3-second timeout
const client = axios.create({
  timeout: 3000
});

// Cache for last known values (graceful degradation)
let cachedMetrics = { cpu: 0, memory: 0, cpuStatus: 'NORMAL', memoryStatus: 'NORMAL' };
let cachedServices = {};

/**
 * Call a service with error handling and timeout
 */
async function callService(name, endpoint, method = 'get', data = null) {
  const url = `${SERVICES[name]}${endpoint}`;
  const start = Date.now();
  
  try {
    const response = method === 'get' 
      ? await client.get(url)
      : await client.post(url, data);
    
    return {
      success: true,
      data: response.data,
      latency: Date.now() - start
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      latency: Date.now() - start
    };
  }
}

/**
 * Get service health status based on response
 */
function getServiceStatus(result) {
  if (!result.success) {
    return { status: 'offline', latency: result.latency };
  }
  if (result.latency > 500) {
    return { status: 'slow', latency: result.latency };
  }
  return { status: 'healthy', latency: result.latency };
}

/**
 * GET /api/status - Aggregate all service data and return pet status
 */
app.get('/api/status', async (req, res) => {
  try {
    // Fetch data from all services concurrently
    const [metricsResult, validatorResult, loadResult] = await Promise.all([
      callService('metrics', '/metrics'),
      callService('validator', '/validate'),
      callService('load', '/load/status')
    ]);

    // Extract metrics (use cached if failed)
    let metrics = cachedMetrics;
    if (metricsResult.success) {
      metrics = {
        cpu: metricsResult.data.cpu,
        memory: metricsResult.data.memory,
        cpuStatus: metricsResult.data.cpuStatus,
        memoryStatus: metricsResult.data.memoryStatus
      };
      cachedMetrics = metrics;
    }

    // Build service health map
    const services = {
      python: getServiceStatus(metricsResult),
      rust: getServiceStatus(validatorResult),
      go: getServiceStatus(loadResult),
      cpp: { status: 'healthy', latency: 0 },
      java: { status: 'healthy', latency: 0 }
    };

    // Check cpp and java health
    const [cppHealth, javaHealth] = await Promise.all([
      callService('chaos', '/health'),
      callService('rules', '/health')
    ]);
    services.cpp = getServiceStatus(cppHealth);
    services.java = getServiceStatus(javaHealth);

    cachedServices = services;

    // Count service states
    const serviceHealth = {
      healthy: Object.values(services).filter(s => s.status === 'healthy').length,
      degraded: Object.values(services).filter(s => s.status === 'slow').length,
      offline: Object.values(services).filter(s => s.status === 'offline').length
    };

    // Get load status
    const load = loadResult.success 
      ? {
          active: loadResult.data.active,
          rps: loadResult.data.actualRps || 0
        }
      : { active: false, rps: 0 };

    // Call rules engine to determine mood
    const rulesPayload = {
      cpu: metrics.cpu,
      memory: metrics.memory,
      errorRate: serviceHealth.offline > 0 ? 20 : (serviceHealth.degraded > 0 ? 5 : 0),
      serviceHealth
    };

    const rulesResult = await callService('rules', '/rules/evaluate', 'post', rulesPayload);

    // Default mood if rules engine fails
    let pet = {
      mood: 'HAPPY',
      message: 'All systems operational!',
      emoji: '😄'
    };

    if (rulesResult.success) {
      pet = {
        mood: rulesResult.data.mood,
        message: rulesResult.data.reason,
        emoji: rulesResult.data.emoji
      };
    } else {
      // Fallback mood calculation
      if (serviceHealth.offline > 0) {
        pet = { mood: 'SICK', message: 'Some services are down!', emoji: '🤒' };
      } else if (metrics.cpu > 90) {
        pet = { mood: 'ANGRY', message: 'CPU is overloaded!', emoji: '😠' };
      } else if (serviceHealth.degraded > 0) {
        pet = { mood: 'NEUTRAL', message: 'Some services are slow...', emoji: '😐' };
      }
    }

    res.json({
      pet,
      metrics,
      services,
      load
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to aggregate status',
      message: error.message
    });
  }
});

/**
 * GET /api/health - Gateway health check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-node'
  });
});


// ============================================
// Proxy endpoints for Chaos and Load services
// ============================================

/**
 * POST /api/chaos/cpu - Proxy to C++ chaos service
 */
app.post('/api/chaos/cpu', async (req, res) => {
  const result = await callService('chaos', '/chaos/cpu', 'post', req.body);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(503).json({
      error: 'Chaos service unavailable',
      message: result.error
    });
  }
});

/**
 * POST /api/chaos/memory - Proxy to C++ chaos service
 */
app.post('/api/chaos/memory', async (req, res) => {
  const result = await callService('chaos', '/chaos/memory', 'post', req.body);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(503).json({
      error: 'Chaos service unavailable',
      message: result.error
    });
  }
});

/**
 * POST /api/load/start - Proxy to Go load simulator
 */
app.post('/api/load/start', async (req, res) => {
  const result = await callService('load', '/load/start', 'post', req.body);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(503).json({
      error: 'Load service unavailable',
      message: result.error
    });
  }
});

/**
 * POST /api/load/stop - Proxy to Go load simulator
 */
app.post('/api/load/stop', async (req, res) => {
  const result = await callService('load', '/load/stop', 'post', {});
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(503).json({
      error: 'Load service unavailable',
      message: result.error
    });
  }
});

// ============================================
// Server startup
// ============================================

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Pet Brain API Gateway running on port ${PORT}`);
});
