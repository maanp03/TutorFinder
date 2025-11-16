const { bookSession, getSessions, acceptSession, rejectSession, cancelSession } = require('../../controllers/sessionController');
const { createMockRequest, createMockResponse, cleanup } = require('../helpers/testHelpers');

jest.mock('../../models/session');
jest.mock('../../models/availability');
jest.mock('../../models/notification');
jest.mock('../../models/tutorProfile');
jest.mock('../../models/clientProfile');

const Session = require('../../models/session');
const Availability = require('../../models/availability');
const Notification = require('../../models/notification');
const Tutor = require('../../models/tutorProfile');
const Client = require('../../models/clientProfile');

describe('Session Controller', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    jest.clearAllMocks();
  });

  // No cleanup needed for unit tests with mocks

  describe('bookSession', () => {
    it('should book a session successfully', async () => {
      // Use a specific date that we can control
      // 2024-12-25 is a Wednesday (weekday 3)
      // Use local time to avoid timezone issues
      const testDate = new Date('2024-12-25T10:00:00');
      const weekday = testDate.getDay(); // Should be 3 (Wednesday)
      const startMinutes = testDate.getHours() * 60 + testDate.getMinutes(); // 10:00 = 600
      const endMinutes = startMinutes + 60; // 11:00 = 660
      
      req.body = {
        tutorId: 'tutor123',
        clientId: 'client123',
        date: testDate.toISOString(),
        duration: 60
      };

      // Mock availability that covers the requested time slot
      const mockAvailability = {
        tutor: 'tutor123',
        weekday: weekday,
        slots: [{ startMinutes: 540, endMinutes: 720 }] // 9:00 AM to 12:00 PM (covers 10-11)
      };

      const mockTutor = { _id: 'tutor123', user: 'user123' };
      const mockSave = jest.fn().mockResolvedValue({
        _id: 'session123',
        tutor: 'tutor123',
        client: 'client123',
        date: new Date('2024-12-25T10:00:00Z'),
        duration: 60,
        status: 'pending'
      });

      Availability.findOne = jest.fn().mockResolvedValue(mockAvailability);
      Tutor.findById = jest.fn().mockResolvedValue(mockTutor);
      Notification.create = jest.fn().mockResolvedValue({});
      
      // Mock Session constructor to return an object with save method
      Session.mockImplementation(function(data) {
        this._id = 'session123';
        this.tutor = data.tutor;
        this.client = data.client;
        this.date = data.date;
        this.duration = data.duration;
        this.status = data.status || 'pending';
        this.save = mockSave;
        return this;
      });

      await bookSession(req, res);

      expect(Availability.findOne).toHaveBeenCalled();
      // Verify session was created and saved
      expect(mockSave).toHaveBeenCalled();
      expect(Notification.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should return error if required fields are missing', async () => {
      req.body = {
        tutorId: 'tutor123'
      };

      await bookSession(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'All fields are required' });
    });

    it('should return error if tutor not available', async () => {
      req.body = {
        tutorId: 'tutor123',
        clientId: 'client123',
        date: '2024-12-25T10:00:00Z',
        duration: 60
      };

      Availability.findOne = jest.fn().mockResolvedValue(null);

      await bookSession(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Tutor not available at the requested time' });
    });
  });

  describe('getSessions', () => {
    it('should get all sessions', async () => {
      req.query = {};
      const mockSessions = [
        { _id: 'session1', tutor: 'tutor1', client: 'client1' },
        { _id: 'session2', tutor: 'tutor2', client: 'client2' }
      ];

      const mockPopulate1 = jest.fn().mockResolvedValue(mockSessions);
      const mockPopulate2 = jest.fn().mockReturnValue({
        populate: mockPopulate1
      });
      Session.find = jest.fn().mockReturnValue({
        populate: mockPopulate2
      });

      await getSessions(req, res);

      expect(Session.find).toHaveBeenCalledWith({});
      expect(mockPopulate2).toHaveBeenCalled();
      expect(mockPopulate1).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockSessions);
    });

    it('should filter sessions by tutorId', async () => {
      req.query = { tutorId: 'tutor123' };
      const mockSessions = [{ _id: 'session1', tutor: 'tutor123' }];

      Session.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSessions)
      });

      await getSessions(req, res);

      expect(Session.find).toHaveBeenCalledWith({ tutor: 'tutor123' });
    });

    it('should filter sessions by clientId', async () => {
      req.query = { clientId: 'client123' };
      const mockSessions = [{ _id: 'session1', client: 'client123' }];

      Session.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockSessions)
      });

      await getSessions(req, res);

      expect(Session.find).toHaveBeenCalledWith({ client: 'client123' });
    });
  });

  describe('acceptSession', () => {
    it('should accept a session', async () => {
      req.params = { id: 'session123' };
      req.body = { message: 'Accepted' };

      const mockSession = {
        _id: 'session123',
        tutor: 'tutor123',
        client: 'client123',
        status: 'accepted'
      };

      const mockClient = { _id: 'client123', user: 'user123' };

      Session.findByIdAndUpdate = jest.fn().mockResolvedValue(mockSession);
      Client.findById = jest.fn().mockResolvedValue(mockClient);
      Notification.create = jest.fn().mockResolvedValue({});

      await acceptSession(req, res);

      expect(Session.findByIdAndUpdate).toHaveBeenCalledWith(
        'session123',
        { status: 'accepted' },
        { new: true }
      );
      expect(Notification.create).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockSession);
    });

    it('should return error if session not found', async () => {
      req.params = { id: 'session123' };
      Session.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await acceptSession(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Session not found' });
    });
  });

  describe('rejectSession', () => {
    it('should reject a session', async () => {
      req.params = { id: 'session123' };
      req.body = { message: 'Rejected' };

      const mockSession = {
        _id: 'session123',
        tutor: 'tutor123',
        client: 'client123',
        status: 'rejected'
      };

      const mockClient = { _id: 'client123', user: 'user123' };

      Session.findByIdAndUpdate = jest.fn().mockResolvedValue(mockSession);
      Client.findById = jest.fn().mockResolvedValue(mockClient);
      Notification.create = jest.fn().mockResolvedValue({});

      await rejectSession(req, res);

      expect(Session.findByIdAndUpdate).toHaveBeenCalledWith(
        'session123',
        { status: 'rejected' },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockSession);
    });
  });

  describe('cancelSession', () => {
    it('should cancel a session', async () => {
      req.params = { id: 'session123' };

      const mockSession = {
        _id: 'session123',
        tutor: 'tutor123',
        client: 'client123',
        status: 'cancelled'
      };

      const mockTutor = { _id: 'tutor123', user: 'user123' };

      Session.findByIdAndUpdate = jest.fn().mockResolvedValue(mockSession);
      Tutor.findById = jest.fn().mockResolvedValue(mockTutor);
      Notification.create = jest.fn().mockResolvedValue({});

      await cancelSession(req, res);

      expect(Session.findByIdAndUpdate).toHaveBeenCalledWith(
        'session123',
        { status: 'cancelled' },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockSession);
    });
  });
});

