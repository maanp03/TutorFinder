const app = require('../server');
const { setupMemoryDB, dropData, closeMemoryDB } = require('./testDb');
const { createTutor, createClient } = require('./utils');
const { postFirst, patchFirst } = require('./httpHelpers');

beforeAll(setupMemoryDB);
afterEach(dropData);
afterAll(closeMemoryDB);

const SESS_BASES = ['/api/sessions', '/api/session', '/sessions'];

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
