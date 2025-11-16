const { listNotifications, markRead, markAllRead } = require('../../controllers/notificationController');
const Notification = require('../../models/notification');
const { createMockRequest, createMockResponse, cleanup } = require('../helpers/testHelpers');

jest.mock('../../models/notification');

describe('Notification Controller', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest('user123');
    res = createMockResponse();
    jest.clearAllMocks();
  });

  // No cleanup needed for unit tests with mocks

  describe('listNotifications', () => {
    it('should list notifications for user', async () => {
      const mockNotifications = [
        { _id: 'notif1', user: 'user123', message: 'Notification 1', read: false },
        { _id: 'notif2', user: 'user123', message: 'Notification 2', read: true }
      ];

      Notification.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockNotifications)
        })
      });

      await listNotifications(req, res);

      expect(Notification.find).toHaveBeenCalledWith({ user: 'user123' });
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
    });

    it('should limit to 50 notifications', async () => {
      Notification.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      });

      await listNotifications(req, res);

      const limitCall = Notification.find().sort().limit;
      expect(limitCall).toHaveBeenCalledWith(50);
    });
  });

  describe('markRead', () => {
    it('should mark a notification as read', async () => {
      req.params = { id: 'notif123' };
      const mockNotification = {
        _id: 'notif123',
        user: 'user123',
        message: 'Test notification',
        read: true
      };

      Notification.findOneAndUpdate = jest.fn().mockResolvedValue(mockNotification);

      await markRead(req, res);

      expect(Notification.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'notif123', user: 'user123' },
        { read: true },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockNotification);
    });

    it('should return error if notification not found', async () => {
      req.params = { id: 'notif123' };
      Notification.findOneAndUpdate = jest.fn().mockResolvedValue(null);

      await markRead(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ msg: 'Notification not found' });
    });
  });

  describe('markAllRead', () => {
    it('should mark all notifications as read', async () => {
      const mockNotifications = [
        { _id: 'notif1', read: true },
        { _id: 'notif2', read: true }
      ];

      Notification.updateMany = jest.fn().mockResolvedValue({});
      Notification.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockNotifications)
        })
      });

      await markAllRead(req, res);

      expect(Notification.updateMany).toHaveBeenCalledWith(
        { user: 'user123', read: false },
        { $set: { read: true } }
      );
      expect(res.json).toHaveBeenCalledWith(mockNotifications);
    });
  });
});

