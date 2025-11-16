const { upsertAvailability, getAvailability } = require('../../controllers/availabilityController');
const Availability = require('../../models/availability');
const Tutor = require('../../models/tutorProfile');
const { createMockRequest, createMockResponse, cleanup } = require('../helpers/testHelpers');

jest.mock('../../models/availability');
jest.mock('../../models/tutorProfile');

describe('Availability Controller', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest('user123', 'tutor');
    res = createMockResponse();
    jest.clearAllMocks();
  });

  // No cleanup needed for unit tests with mocks

  describe('upsertAvailability', () => {
    it('should create availability for tutor', async () => {
      req.body = {
        weekday: 1,
        slots: [
          { startMinutes: 600, endMinutes: 720 },
          { startMinutes: 780, endMinutes: 900 }
        ]
      };

      const mockTutor = { _id: 'tutor123', user: 'user123' };
      Tutor.findOne = jest.fn().mockResolvedValue(mockTutor);
      Availability.findOneAndUpdate = jest.fn().mockResolvedValue({
        _id: 'avail123',
        tutor: 'tutor123',
        weekday: 1,
        slots: [
          { startMinutes: 600, endMinutes: 720 },
          { startMinutes: 780, endMinutes: 900 }
        ]
      });

      await upsertAvailability(req, res);

      expect(Tutor.findOne).toHaveBeenCalledWith({ user: 'user123' });
      expect(Availability.findOneAndUpdate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should filter invalid slots', async () => {
      req.body = {
        weekday: 1,
        slots: [
          { startMinutes: 600, endMinutes: 720 },
          { startMinutes: 800, endMinutes: 700 }, // Invalid: end < start
          { startMinutes: 'invalid', endMinutes: 900 }, // Invalid: not a number
          { startMinutes: 780, endMinutes: 900 }
        ]
      };

      const mockTutor = { _id: 'tutor123', user: 'user123' };
      Tutor.findOne = jest.fn().mockResolvedValue(mockTutor);
      const mockResult = { _id: 'avail123', slots: [] };
      Availability.findOneAndUpdate = jest.fn().mockResolvedValue(mockResult);

      await upsertAvailability(req, res);

      // Verify that findOneAndUpdate was called
      expect(Availability.findOneAndUpdate).toHaveBeenCalled();
      const callArgs = Availability.findOneAndUpdate.mock.calls[0];
      // findOneAndUpdate(query, update, options)
      // The second argument is the update object
      const updateObject = callArgs[1];
      expect(updateObject.slots).toBeDefined();
      expect(Array.isArray(updateObject.slots)).toBe(true);
      // Should have filtered out invalid slots (only 2 valid ones)
      expect(updateObject.slots.length).toBe(2);
    });

    it('should return error if user is not a tutor', async () => {
      req.body = { weekday: 1, slots: [] };
      Tutor.findOne = jest.fn().mockResolvedValue(null);

      await upsertAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Only tutors can set availability' });
    });

    it('should return error if weekday or slots missing', async () => {
      req.body = { weekday: 1 };
      const mockTutor = { _id: 'tutor123', user: 'user123' };
      Tutor.findOne = jest.fn().mockResolvedValue(mockTutor);

      await upsertAvailability(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'weekday and slots are required' });
    });
  });

  describe('getAvailability', () => {
    it('should get availability by tutorId', async () => {
      req.query = { tutorId: 'tutor123' };
      const mockAvailability = [
        { _id: 'avail1', tutor: 'tutor123', weekday: 1 },
        { _id: 'avail2', tutor: 'tutor123', weekday: 2 }
      ];

      Availability.find = jest.fn().mockResolvedValue(mockAvailability);

      await getAvailability(req, res);

      expect(Availability.find).toHaveBeenCalledWith({ tutor: 'tutor123' });
      expect(res.json).toHaveBeenCalledWith(mockAvailability);
    });

    it('should get availability by weekday', async () => {
      req.query = { weekday: '1' };
      const mockAvailability = [{ _id: 'avail1', tutor: 'tutor123', weekday: 1 }];

      Availability.find = jest.fn().mockResolvedValue(mockAvailability);

      await getAvailability(req, res);

      expect(Availability.find).toHaveBeenCalledWith({ weekday: 1 });
      expect(res.json).toHaveBeenCalledWith(mockAvailability);
    });

    it('should get all availability if no filters', async () => {
      req.query = {};
      const mockAvailability = [
        { _id: 'avail1', tutor: 'tutor123', weekday: 1 },
        { _id: 'avail2', tutor: 'tutor456', weekday: 2 }
      ];

      Availability.find = jest.fn().mockResolvedValue(mockAvailability);

      await getAvailability(req, res);

      expect(Availability.find).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith(mockAvailability);
    });
  });
});

