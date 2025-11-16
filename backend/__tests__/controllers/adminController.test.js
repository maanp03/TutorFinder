const { adminLogin, getTutors, getClients, deleteTutor, deleteClient } = require('../../controllers/adminController');
const Tutor = require('../../models/tutorProfile');
const Client = require('../../models/clientProfile');
const User = require('../../models/User');
const Session = require('../../models/session');
const jwt = require('jsonwebtoken');
const { createMockRequest, createMockResponse, cleanup } = require('../helpers/testHelpers');

jest.mock('../../models/tutorProfile');
jest.mock('../../models/clientProfile');
jest.mock('../../models/User');
jest.mock('../../models/session');
jest.mock('jsonwebtoken');

describe('Admin Controller', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('adminLogin', () => {
    it('should login admin with correct credentials', async () => {
      req.body = {
        email: 'admin@exmail.com',
        password: '123'
      };

      jwt.sign = jest.fn().mockImplementation((payload, secret, options, callback) => {
        callback(null, 'admin-token');
      });

      await adminLogin(req, res);

      expect(jwt.sign).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        token: 'admin-token',
        role: 'admin',
        userId: 'admin',
        name: 'Administrator'
      });
    });

    it('should reject login with incorrect email', async () => {
      req.body = {
        email: 'wrong@email.com',
        password: '123'
      };

      await adminLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
    });

    it('should reject login with incorrect password', async () => {
      req.body = {
        email: 'admin@exmail.com',
        password: 'wrongpassword'
      };

      await adminLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid credentials' });
    });
  });

  describe('getTutors', () => {
    it('should get all tutors', async () => {
      const mockTutors = [
        { _id: 'tutor1', name: 'Tutor 1' },
        { _id: 'tutor2', name: 'Tutor 2' }
      ];

      Tutor.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTutors)
      });

      await getTutors(req, res);

      expect(Tutor.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockTutors);
    });

    it('should handle server errors', async () => {
      Tutor.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      await getTutors(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Server error');
    });
  });

  describe('getClients', () => {
    it('should get all clients', async () => {
      const mockClients = [
        { _id: 'client1', name: 'Client 1' },
        { _id: 'client2', name: 'Client 2' }
      ];

      Client.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockClients)
      });

      await getClients(req, res);

      expect(Client.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockClients);
    });
  });

  describe('deleteTutor', () => {
    it('should delete tutor and associated data', async () => {
      req.params = { tutorId: 'tutor123' };
      const mockTutor = { _id: 'tutor123', user: 'user123' };

      Tutor.findById = jest.fn().mockResolvedValue(mockTutor);
      User.findByIdAndDelete = jest.fn().mockResolvedValue({});
      Tutor.findByIdAndDelete = jest.fn().mockResolvedValue({});
      Session.deleteMany = jest.fn().mockResolvedValue({});

      await deleteTutor(req, res);

      expect(Tutor.findById).toHaveBeenCalledWith('tutor123');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user123');
      expect(Tutor.findByIdAndDelete).toHaveBeenCalledWith('tutor123');
      expect(Session.deleteMany).toHaveBeenCalledWith({ tutor: 'tutor123' });
      expect(res.json).toHaveBeenCalledWith({ msg: 'Tutor and all associated data deleted successfully' });
    });

    it('should return error if tutor not found', async () => {
      req.params = { tutorId: 'tutor123' };
      Tutor.findById = jest.fn().mockResolvedValue(null);

      await deleteTutor(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Tutor not found' });
    });
  });

  describe('deleteClient', () => {
    it('should delete client and associated data', async () => {
      req.params = { clientId: 'client123' };
      const mockClient = { _id: 'client123', user: 'user123' };

      Client.findById = jest.fn().mockResolvedValue(mockClient);
      User.findByIdAndDelete = jest.fn().mockResolvedValue({});
      Client.findByIdAndDelete = jest.fn().mockResolvedValue({});
      Session.deleteMany = jest.fn().mockResolvedValue({});

      await deleteClient(req, res);

      expect(Client.findById).toHaveBeenCalledWith('client123');
      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user123');
      expect(Client.findByIdAndDelete).toHaveBeenCalledWith('client123');
      expect(Session.deleteMany).toHaveBeenCalledWith({ client: 'client123' });
      expect(res.json).toHaveBeenCalledWith({ msg: 'Client and all associated data deleted successfully' });
    });
  });
});

