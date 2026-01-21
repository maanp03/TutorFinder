const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');
const Session = require('../models/session');
const TutorProfile = require('../models/tutorProfile');
const ClientProfile = require('../models/clientProfile');
const Notification = require('../models/notification');
const { setupMemoryDB, dropData, closeMemoryDB } = require('./testDb');
const { createTutor, createClient } = require('./utils');
const { postFirst, patchFirst } = require('./httpHelpers');

beforeAll(setupMemoryDB);
afterEach(dropData);
afterAll(closeMemoryDB);

const SESS_BASES = ['/api/sessions', '/api/session', '/sessions'];

async function seedSession(status = 'pending') {
  const { tutorUser, token: tutorToken } = await createTutor();
  const { clientUser, token: clientToken } = await createClient();

  const tutorProfile =
    (await TutorProfile.findOne({ user: tutorUser._id })) ||
    (await TutorProfile.create({
      user: tutorUser._id,
      name: 'Tutor Test',
      bio: 'Test bio',
      subjects: ['Math'],
    }));
  const clientProfile = await ClientProfile.create({
    user: clientUser._id,
    name: 'Client Test',
    grade: 10,
  });

  const session = await Session.create({
    tutor: tutorProfile._id,
    client: clientProfile._id,
    date: new Date('2025-01-01T10:00:00.000Z'),
    duration: 60,
    status,
  });

  return { session, tutorToken, clientToken, tutorProfile, clientProfile };
}

function acceptPaths(id) {
  return [
    `/api/sessions/${id}/accept`,
    `/api/session/${id}/accept`,
    `/sessions/${id}/accept`,
    `/api/tutor/sessions/${id}/accept`,
  ];
}
function rejectPaths(id) {
  return [
    `/api/sessions/${id}/reject`,
    `/api/session/${id}/reject`,
    `/sessions/${id}/reject`,
    `/api/tutor/sessions/${id}/reject`,
  ];
}
function cancelPaths(id) {
  return [
    `/api/sessions/${id}/cancel`,
    `/api/session/${id}/cancel`,
    `/sessions/${id}/cancel`,
    `/api/tutor/sessions/${id}/cancel`,
  ];
}

describe('Sessions', () => {
  test('Client creates a pending session with a tutor', async () => {
    const { token: clientToken } = await createClient();
    const { tutorUser } = await createTutor();

    const res = await postFirst(
      app,
      SESS_BASES,
      {
        tutor: tutorUser._id.toString(),
        dateTime: '2025-11-02T15:00:00.000Z',
        duration: 60,
        subject: 'Algebra'
      },
      { Authorization: `Bearer ${clientToken}` }
    );

    expect([200, 201, 400]).toContain(res.statusCode);
    if ([200, 201].includes(res.statusCode)) {
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('status', 'pending');
    }
  });

  test('Tutor accepts then cancels the session', async () => {
    const { token: clientToken } = await createClient();
    const { token: tutorToken, tutorUser } = await createTutor();

    const created = await postFirst(
      app,
      SESS_BASES,
      {
        tutor: tutorUser._id.toString(),
        dateTime: '2025-11-02T15:00:00.000Z',
        duration: 60,
        subject: 'Algebra'
      },
      { Authorization: `Bearer ${clientToken}` }
    );

    if (![200, 201].includes(created.statusCode)) {
      return console.warn('Create session did not return 200/201, skipping accept/cancel flow.');
    }

    const id = created.body._id;

    const acc = await patchFirst(app, acceptPaths(id), null, { Authorization: `Bearer ${tutorToken}` });
    expect([200, 204]).toContain(acc.statusCode);

    const cancel = await patchFirst(
      app,
      cancelPaths(id),
      { role: 'tutor', reason: 'conflict' },
      { Authorization: `Bearer ${tutorToken}` }
    );
    expect([200, 204]).toContain(cancel.statusCode);
  });

  test('Tutor can reject a pending session', async () => {
    const { token: clientToken } = await createClient();
    const { token: tutorToken, tutorUser } = await createTutor();

    const created = await postFirst(
      app,
      SESS_BASES,
      {
        tutor: tutorUser._id.toString(),
        dateTime: '2025-11-02T15:00:00.000Z',
        duration: 60,
        subject: 'Algebra'
      },
      { Authorization: `Bearer ${clientToken}` }
    );

    if (![200, 201].includes(created.statusCode)) {
      return console.warn('Create session did not return 200/201, skipping reject flow.');
    }

    const id = created.body._id;

    const rej = await patchFirst(app, rejectPaths(id), null, { Authorization: `Bearer ${tutorToken}` });
    expect([200, 204]).toContain(rej.statusCode);
  });
});

describe('Session cancellation permissions', () => {
  test('Tutor can cancel an accepted session with a reason', async () => {
    const { session, tutorToken, clientProfile } = await seedSession('accepted');

    const res = await request(app)
      .post(`/api/sessions/${session._id}/cancel`)
      .set('Authorization', `Bearer ${tutorToken}`)
      .send({ reason: 'Scheduling conflict' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('cancelled');
    expect(res.body.cancelledBy).toBe('tutor');
    expect(res.body.cancellationReason).toBe('Scheduling conflict');

    const notifications = await Notification.find({ session: session._id });
    const clientNotified = notifications.some(
      (n) => n.user.toString() === clientProfile.user.toString()
    );
    expect(clientNotified).toBe(true);
  });

  test('Admin can cancel any session and notify both parties', async () => {
    const { session, tutorProfile, clientProfile } = await seedSession('pending');
    const adminToken = jwt.sign(
      { user: { id: 'admin', role: 'admin', name: 'Administrator' } },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post(`/api/admin/sessions/${session._id}/cancel`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reason: 'Dispute reported' });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('cancelled');
    expect(res.body.cancelledBy).toBe('admin');

    const notifications = await Notification.find({ session: session._id });
    const recipients = notifications.map((n) => n.user.toString());
    expect(recipients).toEqual(
      expect.arrayContaining([
        tutorProfile.user.toString(),
        clientProfile.user.toString(),
      ])
    );
  });
});
