/**
 * Integration test example using Supertest
 * This demonstrates black box testing of API endpoints
 * 
 * To run: npm test -- authRoutes.integration.test.js
 * 
 * Note: This requires a test database connection
 * These tests are skipped by default - uncomment and configure database to run
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../../routes/authRoutes');
const User = require('../../models/User');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe.skip('Auth Routes Integration Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    // In production, use a separate test database
    // Uncomment and configure when you have a test database
    // if (process.env.MONGO_URI_TEST) {
    //   await mongoose.connect(process.env.MONGO_URI_TEST);
    // }
  }, 30000); // Increase timeout for database connection

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }, 30000);

  beforeEach(async () => {
    // Clean up test data
    // Only run if connected to database
    if (mongoose.connection.readyState === 1) {
      await User.deleteMany({});
    }
  }, 10000);

  describe('POST /api/auth/register', () => {
    it('should register a new tutor successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Tutor',
          email: 'tutor@test.com',
          password: 'password123',
          role: 'tutor'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('userId');
      expect(res.body.role).toBe('tutor');
      expect(res.body.name).toBe('Test Tutor');
    });

    it('should register a new client successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Client',
          email: 'client@test.com',
          password: 'password123',
          role: 'client'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.role).toBe('client');
    });

    it('should reject duplicate email registration', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'First User',
          email: 'duplicate@test.com',
          password: 'password123',
          role: 'tutor'
        });

      // Try to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Second User',
          email: 'duplicate@test.com',
          password: 'password123',
          role: 'client'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('User already exists');
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          // Missing email, password, role
        });

      // Express validation will handle this
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'login@test.com',
          password: 'password123',
          role: 'tutor'
        });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('userId');
      expect(res.body.role).toBe('tutor');
    });

    it('should reject login with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@test.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.msg).toBe('Invalid credentials');
    });
  });
});

