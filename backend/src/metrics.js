const client = require('prom-client');

// Collect default Node.js metrics (memory, CPU, event loop, GC)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// ─── HTTP Metrics ───────────────────────────────────────────────────────────

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// ─── Business Metrics (gauges updated periodically) ─────────────────────────

const activeUsers = new client.Gauge({
  name: 'soulsupport_active_users_total',
  help: 'Total number of active users',
  registers: [register],
});

const activeTherapists = new client.Gauge({
  name: 'soulsupport_active_therapists_total',
  help: 'Total number of active therapists',
  registers: [register],
});

const verifiedTherapists = new client.Gauge({
  name: 'soulsupport_verified_therapists_total',
  help: 'Total number of verified therapists',
  registers: [register],
});

const totalSessions = new client.Gauge({
  name: 'soulsupport_sessions_total',
  help: 'Total number of sessions',
  labelNames: ['status'],
  registers: [register],
});

const totalReviews = new client.Gauge({
  name: 'soulsupport_reviews_total',
  help: 'Total number of reviews',
  registers: [register],
});

const totalForumPosts = new client.Gauge({
  name: 'soulsupport_forum_posts_total',
  help: 'Total number of forum posts',
  registers: [register],
});

const totalResources = new client.Gauge({
  name: 'soulsupport_resources_total',
  help: 'Total number of published resources',
  registers: [register],
});

// ─── Refresh business metrics from DB ───────────────────────────────────────

let refreshInterval = null;

async function refreshBusinessMetrics() {
  try {
    const User = require('./models/User.model');
    const TherapistProfile = require('./models/TherapistProfile.model');
    const Session = require('./models/Session.model');
    const Review = require('./models/Review.model');
    const ForumPost = require('./models/ForumPost.model');
    const Resource = require('./models/Resource.model');

    const [
      users,
      therapists,
      verified,
      sessions,
      completedSessions,
      pendingSessions,
      cancelledSessions,
      reviews,
      posts,
      resources,
    ] = await Promise.all([
      User.countDocuments({ userType: 'user', isActive: true }),
      User.countDocuments({ userType: 'therapist', isActive: true }),
      TherapistProfile.countDocuments({ isVerified: true }),
      Session.countDocuments(),
      Session.countDocuments({ status: 'completed' }),
      Session.countDocuments({ status: 'pending' }),
      Session.countDocuments({ status: { $in: ['cancelled_by_user', 'cancelled_by_therapist'] } }),
      Review.countDocuments(),
      ForumPost.countDocuments(),
      Resource.countDocuments({ isPublished: true }),
    ]);

    activeUsers.set(users);
    activeTherapists.set(therapists);
    verifiedTherapists.set(verified);
    totalSessions.labels('all').set(sessions);
    totalSessions.labels('completed').set(completedSessions);
    totalSessions.labels('pending').set(pendingSessions);
    totalSessions.labels('cancelled').set(cancelledSessions);
    totalReviews.set(reviews);
    totalForumPosts.set(posts);
    totalResources.set(resources);
  } catch (err) {
    // DB may not be ready yet — silently skip
  }
}

function startMetricsRefresh(intervalMs = 30000) {
  refreshBusinessMetrics();
  refreshInterval = setInterval(refreshBusinessMetrics, intervalMs);
}

function stopMetricsRefresh() {
  if (refreshInterval) clearInterval(refreshInterval);
}

// ─── Express middleware to track HTTP metrics ───────────────────────────────

function metricsMiddleware(req, res, next) {
  // Skip metrics endpoint itself
  if (req.path === '/metrics') return next();

  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    };
    end(labels);
    httpRequestsTotal.inc(labels);
  });
  next();
}

module.exports = {
  register,
  metricsMiddleware,
  startMetricsRefresh,
  stopMetricsRefresh,
};
