const jwtMiddleware = require('../../middleware/JwtMiddleware');
const jwt = require('jsonwebtoken');
const { createMockRequest, createMockResponse } = require('../helpers/testHelpers');

jest.mock('jsonwebtoken');

describe('JWT Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
    next = jest.fn();
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  it('should allow request with valid token', () => {
    req.header = jest.fn().mockReturnValue('Bearer valid-token');
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 'user123', role: 'tutor' } });

    jwtMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
    expect(req.user).toEqual({ user: { id: 'user123', role: 'tutor' } });
    expect(next).toHaveBeenCalled();
  });

  it('should reject request without token', () => {
    req.header = jest.fn().mockReturnValue(null);

    jwtMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with invalid token format', () => {
    req.header = jest.fn().mockReturnValue('InvalidFormat');

    jwtMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'No token provided' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with invalid token', () => {
    req.header = jest.fn().mockReturnValue('Bearer invalid-token');
    jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('Invalid token');
    });

    jwtMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token is not valid' });
    expect(next).not.toHaveBeenCalled();
  });
});

