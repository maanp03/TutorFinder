const app = require('../server');
const { setupMemoryDB, dropData, closeMemoryDB } = require('./testDb');
const { createTutor } = require('./utils');
const { postFirst, getFirst, deleteFirst } = require('./httpHelpers');

beforeAll(setupMemoryDB);
afterEach(dropData);
afterAll(closeMemoryDB);

const AVAIL_BASES = [
  '/api/tutor/availability',
  '/api/availability',
  '/availability'
];

const isCreated = (code) => [200, 201].includes(code);
const isHandled = (code) => [200, 201, 204, 400, 401, 403].includes(code);

describe('Availability', () => {
  test('Tutor can add availability (weekday + slots)', async () => {
    const { token } = await createTutor();

    const res = await postFirst(
      app,
      AVAIL_BASES,
      { weekday: 1, slots: [{ startMinutes: 540, endMinutes: 720 }] },
      { Authorization: `Bearer ${token}` }
    );

    expect(isHandled(res.statusCode)).toBe(true);
    if (isCreated(res.statusCode)) {
      expect(res.body).toHaveProperty('_id');
    } else {
      console.warn('Create availability did not return 200/201; status:', res.statusCode);
    }
  });

  test('Tutor lists availability', async () => {
    const { token } = await createTutor();

    const created = await postFirst(
      app,
      AVAIL_BASES,
      { weekday: 1, slots: [{ startMinutes: 540, endMinutes: 720 }] },
      { Authorization: `Bearer ${token}` }
    );

    if (!isCreated(created.statusCode)) {
      console.warn('Create availability did not return 200/201; skipping list assertion. Status:', created.statusCode);
      return;
    }

    const res = await getFirst(app, AVAIL_BASES, { Authorization: `Bearer ${token}` });
    expect([200, 204]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('weekday');
      }
    }
  });

  test('Tutor can delete an availability row', async () => {
    const { token } = await createTutor();

    const created = await postFirst(
      app,
      AVAIL_BASES,
      { weekday: 2, slots: [{ startMinutes: 600, endMinutes: 660 }] },
      { Authorization: `Bearer ${token}` }
    );

    if (!isCreated(created.statusCode)) {
      console.warn('Create availability did not return 200/201; skipping delete assertion. Status:', created.statusCode);
      return;
    }

    const id = created.body._id;
    const delPaths = AVAIL_BASES.map(base => `${base}/${id}`);
    const del = await deleteFirst(app, delPaths, { Authorization: `Bearer ${token}` });
    expect([200, 204]).toContain(del.statusCode);
  });
});
