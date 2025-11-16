const { createOrUpdateClientProfile, getClientProfile, deleteAccount } = require('../../controllers/clientController');
const User = require('../../models/User');
const Client = require('../../models/clientProfile');
const { createMockRequest, createMockResponse, cleanup } = require('../helpers/testHelpers');

jest.mock('../../models/User');
jest.mock('../../models/clientProfile');
jest.mock('../../models/session', () => ({
  deleteMany: jest.fn().mockResolvedValue({})
}));

describe('Client Controller', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest('user123', 'client');
    res = createMockResponse();
    jest.clearAllMocks();
  });

  // No cleanup needed for unit tests with mocks

  describe('createOrUpdateClientProfile', () => {
    it('should create a new client profile', async () => {
      req.body = {
        name: 'Jane Client',
        grade: 10
      };

      const mockUser = { _id: 'user123', role: 'client' };
      User.findById = jest.fn().mockResolvedValue(mockUser);
      Client.findOne = jest.fn().mockResolvedValue(null);
      Client.prototype.save = jest.fn().mockResolvedValue({
        _id: 'client123',
        user: 'user123',
        name: 'Jane Client',
        grade: 10
      });

      await createOrUpdateClientProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Client.findOne).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.json).toHaveBeenCalled();
    });

    it('should update existing client profile', async () => {
      req.body = {
        name: 'Jane Client Updated',
        grade: 11
      };

      const mockUser = { _id: 'user123', role: 'client' };
      const existingClient = {
        _id: 'client123',
        user: 'user123',
        name: 'Jane Client',
        grade: 10,
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);
      Client.findOne = jest.fn().mockResolvedValue(existingClient);

      await createOrUpdateClientProfile(req, res);

      expect(existingClient.name).toBe('Jane Client Updated');
      expect(existingClient.grade).toBe(11);
      expect(existingClient.save).toHaveBeenCalled();
    });

    it('should return error if user not authenticated', async () => {
      req.user = null;

      await createOrUpdateClientProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not authenticated properly' });
    });

    it('should return error if user is not a client', async () => {
      req.body = { name: 'Jane', grade: 10 };
      User.findById = jest.fn().mockResolvedValue({ _id: 'user123', role: 'tutor' });

      await createOrUpdateClientProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid client ID or role' });
    });
  });

  describe('getClientProfile', () => {
    it('should get client profile by userId', async () => {
      req.params = { userId: 'user123' };
      const mockClient = {
        _id: 'client123',
        user: 'user123',
        name: 'Jane Client',
        grade: 10
      };
      Client.findOne = jest.fn().mockResolvedValue(mockClient);

      await getClientProfile(req, res);

      expect(Client.findOne).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.json).toHaveBeenCalledWith(mockClient);
    });

    it('should return error if client profile not found', async () => {
      req.params = { userId: 'user123' };
      Client.findOne = jest.fn().mockResolvedValue(null);

      await getClientProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Client profile not found' });
    });
  });

  describe('deleteAccount', () => {
    it('should delete client account and associated data', async () => {
      const mockUser = { _id: 'user123', role: 'client' };
      const mockClient = { _id: 'client123', user: 'user123' };
      const Session = require('../../models/session');

      User.findById = jest.fn().mockResolvedValue(mockUser);
      Client.findOne = jest.fn().mockResolvedValue(mockClient);
      User.findByIdAndDelete = jest.fn().mockResolvedValue(mockUser);
      Client.findByIdAndDelete = jest.fn().mockResolvedValue(mockClient);
      Session.deleteMany = jest.fn().mockResolvedValue({});

      await deleteAccount(req, res);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user123');
      expect(Client.findByIdAndDelete).toHaveBeenCalledWith('client123');
      expect(Session.deleteMany).toHaveBeenCalledWith({ client: 'client123' });
      expect(res.json).toHaveBeenCalledWith({ msg: 'Client and all associated data deleted successfully' });
    });
  });
});

