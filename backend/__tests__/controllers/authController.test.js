const { register, login } = require('../../controllers/authController');
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createMockRequest, createMockResponse, cleanup } = require('../helpers/testHelpers');

// Mock dependencies
jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  // No cleanup needed for unit tests with mocks

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'tutor'
      };

      User.findOne = jest.fn().mockResolvedValue(null);
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@test.com',
        role: 'tutor',
        password: 'hashedpassword',
        save: jest.fn().mockResolvedValue(true)
      };
      // Mock the User constructor to return our mock user
      User.mockImplementation(function(data) {
        this._id = mockUser._id;
        this.name = data.name;
        this.email = data.email;
        this.role = data.role;
        this.password = data.password;
        this.save = mockUser.save;
        return this;
      });
      bcrypt.genSalt = jest.fn().mockResolvedValue('salt');
      bcrypt.hash = jest.fn().mockResolvedValue('hashedpassword');
      jwt.sign = jest.fn().mockImplementation((payload, secret, options, callback) => {
        callback(null, 'mock-token');
      });

      await register(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@test.com' });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: 'mock-token',
          userId: expect.any(String),
          role: 'tutor',
          name: 'John Doe'
        })
      );
    });

    it('should return error if user already exists', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'tutor'
      };

      User.findOne = jest.fn().mockResolvedValue({ email: 'john@test.com' });

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User already exists' });
    });

    it('should handle server errors', async () => {
      req.body = {
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'tutor'
      };

      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server error');
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      req.body = {
        email: 'john@test.com',
        password: 'password123'
      };

      const mockUser = {
        _id: 'user123',
        email: 'john@test.com',
        password: 'hashedpassword',
        role: 'tutor',
        name: 'John Doe'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      jwt.sign = jest.fn().mockImplementation((payload, secret, options, callback) => {
        callback(null, 'mock-token');
      });

      await login(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'john@test.com' });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(res.json).toHaveBeenCalledWith({
        token: 'mock-token',
        userId: 'user123',
        role: 'tutor',
        name: 'John Doe'
      });
    });

    it('should return error if user not found', async () => {
      req.body = {
        email: 'john@test.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
    });

    it('should return error if password is incorrect', async () => {
      req.body = {
        email: 'john@test.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        _id: 'user123',
        email: 'john@test.com',
        password: 'hashedpassword',
        role: 'tutor'
      };

      User.findOne = jest.fn().mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
    });

    it('should handle server errors', async () => {
      req.body = {
        email: 'john@test.com',
        password: 'password123'
      };

      User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server error');
    });
  });
});

