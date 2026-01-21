const { createTutorProfile, getTutorProfile, getAllTutors, deleteAccount } = require('../../controllers/tutorController');
const User = require('../../models/User');
const Tutor = require('../../models/tutorProfile');
const { createMockRequest, createMockResponse, cleanup } = require('../helpers/testHelpers');

jest.mock('../../models/User');
jest.mock('../../models/tutorProfile');
jest.mock('../../models/session', () => ({
  deleteMany: jest.fn().mockResolvedValue({})
}));

describe('Tutor Controller', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest('user123', 'tutor');
    res = createMockResponse();
    jest.clearAllMocks();
  });

  // No cleanup needed for unit tests with mocks

  describe('createTutorProfile', () => {
    it('should create a new tutor profile', async () => {
      req.body = {
        name: 'John Tutor',
        bio: 'Experienced math tutor',
        subjects: ['Math', 'Physics']
      };

      const mockUser = { _id: 'user123', role: 'tutor' };
      User.findById = jest.fn().mockResolvedValue(mockUser);
      Tutor.findOne = jest.fn().mockResolvedValue(null);
      Tutor.prototype.save = jest.fn().mockResolvedValue({
        _id: 'tutor123',
        user: 'user123',
        name: 'John Tutor',
        bio: 'Experienced math tutor',
        subjects: ['Math', 'Physics']
      });

      await createTutorProfile(req, res);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(Tutor.findOne).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.json).toHaveBeenCalled();
    });

    it('should update existing tutor profile', async () => {
      req.body = {
        name: 'John Tutor Updated',
        bio: 'Updated bio',
        subjects: ['Math']
      };

      const mockUser = { _id: 'user123', role: 'tutor' };
      const existingTutor = {
        _id: 'tutor123',
        user: 'user123',
        name: 'John Tutor',
        bio: 'Old bio',
        subjects: ['Math'],
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById = jest.fn().mockResolvedValue(mockUser);
      Tutor.findOne = jest.fn().mockResolvedValue(existingTutor);

      await createTutorProfile(req, res);

      expect(existingTutor.name).toBe('John Tutor Updated');
      expect(existingTutor.bio).toBe('Updated bio');
      expect(existingTutor.subjects).toEqual(['Math']);
      expect(existingTutor.save).toHaveBeenCalled();
    });

    it('should return error if user not authenticated', async () => {
      req.user = null;

      await createTutorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'User not authenticated properly' });
    });

    it('should return error if user is not a tutor', async () => {
      req.body = { name: 'John', bio: 'Bio', subjects: [] };
      User.findById = jest.fn().mockResolvedValue({ _id: 'user123', role: 'client' });

      await createTutorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Invalid tutor ID' });
    });
  });

  describe('getTutorProfile', () => {
    it('should get tutor profile by userId', async () => {
      req.params = { userId: 'user123' };
      const mockTutor = {
        _id: 'tutor123',
        user: 'user123',
        name: 'John Tutor',
        populate: jest.fn().mockReturnThis()
      };
      Tutor.findOne = jest.fn().mockReturnValue(mockTutor);
      mockTutor.populate = jest.fn().mockResolvedValue(mockTutor);

      await getTutorProfile(req, res);

      expect(Tutor.findOne).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.json).toHaveBeenCalled();
    });

    it('should return error if tutor profile not found', async () => {
      req.params = { userId: 'user123' };
      Tutor.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await getTutorProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Tutor profile not found' });
    });
  });

  describe('getAllTutors', () => {
    it('should get all tutors', async () => {
      const mockTutors = [
        { _id: 'tutor1', name: 'Tutor 1' },
        { _id: 'tutor2', name: 'Tutor 2' }
      ];
      Tutor.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTutors)
      });

      await getAllTutors(req, res);

      expect(Tutor.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockTutors);
    });
  });

  describe('deleteAccount', () => {
    it('should delete tutor account and associated data', async () => {
      const mockUser = { _id: 'user123', role: 'tutor' };
      const mockTutor = { _id: 'tutor123', user: 'user123' };
      const Session = require('../../models/session');

      User.findById = jest.fn().mockResolvedValue(mockUser);
      Tutor.findOne = jest.fn().mockResolvedValue(mockTutor);
      User.findByIdAndDelete = jest.fn().mockResolvedValue(mockUser);
      Tutor.findByIdAndDelete = jest.fn().mockResolvedValue(mockTutor);
      Session.deleteMany = jest.fn().mockResolvedValue({});

      await deleteAccount(req, res);

      expect(User.findByIdAndDelete).toHaveBeenCalledWith('user123');
      expect(Tutor.findByIdAndDelete).toHaveBeenCalledWith('tutor123');
      expect(Session.deleteMany).toHaveBeenCalledWith({ tutor: 'tutor123' });
      expect(res.json).toHaveBeenCalledWith({ msg: 'Tutor and all associated data deleted successfully' });
    });

    it('should return error if tutor not found', async () => {
      const mockUser = { _id: 'user123', role: 'tutor' };
      User.findById = jest.fn().mockResolvedValue(mockUser);
      Tutor.findOne = jest.fn().mockResolvedValue(null);

      await deleteAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Tutor not found' });
    });
  });
});

