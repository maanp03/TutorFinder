const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Tutor = require('../../models/tutorProfile');
const Client = require('../../models/clientProfile');

/**
 * Generate a JWT token for testing
 */
const generateToken = (userId, role = 'tutor', name = 'Test User') => {
  const payload = { user: { id: userId, role, name } };
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret-key-for-jwt', { expiresIn: '1h' });
};

/**
 * Create a mock request object with authentication
 */
const createMockRequest = (userId, role = 'tutor', name = 'Test User') => {
  return {
    user: {
      user: {
        id: userId,
        role,
        name
      }
    },
    body: {},
    params: {},
    query: {},
    header: jest.fn()
  };
};

/**
 * Create a mock response object
 */
const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create test user
 */
const createTestUser = async (role = 'tutor', email = `test${Date.now()}@test.com`) => {
  const user = new User({
    name: 'Test User',
    email,
    password: 'hashedpassword',
    role
  });
  await user.save();
  return user;
};

/**
 * Create test tutor profile
 */
const createTestTutor = async (userId) => {
  const tutor = new Tutor({
    user: userId,
    name: 'Test Tutor',
    bio: 'Test bio',
    subjects: ['Math', 'Science']
  });
  await tutor.save();
  return tutor;
};

/**
 * Create test client profile
 */
const createTestClient = async (userId) => {
  const client = new Client({
    user: userId,
    name: 'Test Client',
    grade: 10
  });
  await client.save();
  return client;
};

/**
 * Clean up test data
 * Note: Only use this in integration tests with real database connections
 * For unit tests with mocks, this is not needed
 */
const cleanup = async () => {
  // Only cleanup if models are not mocked
  try {
    if (User.deleteMany && typeof User.deleteMany === 'function' && !User.deleteMany._isMockFunction) {
      await User.deleteMany({});
    }
    if (Tutor.deleteMany && typeof Tutor.deleteMany === 'function' && !Tutor.deleteMany._isMockFunction) {
      await Tutor.deleteMany({});
    }
    if (Client.deleteMany && typeof Client.deleteMany === 'function' && !Client.deleteMany._isMockFunction) {
      await Client.deleteMany({});
    }
  } catch (err) {
    // Silently fail if models are mocked
  }
};

module.exports = {
  generateToken,
  createMockRequest,
  createMockResponse,
  createTestUser,
  createTestTutor,
  createTestClient,
  cleanup
};

