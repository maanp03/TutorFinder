const request = require('supertest');

async function postFirst(app, paths, body, headers = {}) {
  let lastRes = null;
  for (const p of paths) {
    const r = await request(app).post(p)
      .set(headers)
      .set('Content-Type', 'application/json')
      .send(body);
    lastRes = r;
    if (r.statusCode !== 404) return r;
  }
  return lastRes;
}

async function getFirst(app, paths, headers = {}) {
  let lastRes = null;
  for (const p of paths) {
    const r = await request(app).get(p).set(headers);
    lastRes = r;
    if (r.statusCode !== 404) return r;
  }
  return lastRes;
}

async function patchFirst(app, paths, body, headers = {}) {
  let lastRes = null;
  for (const p of paths) {
    const r = await request(app).patch(p)
      .set(headers)
      .set('Content-Type', 'application/json')
      .send(body ?? {});
    lastRes = r;
    if (r.statusCode !== 404) return r;
  }
  return lastRes;
}

async function deleteFirst(app, paths, headers = {}) {
  let lastRes = null;
  for (const p of paths) {
    const r = await request(app).delete(p).set(headers);
    lastRes = r;
    if (r.statusCode !== 404) return r;
  }
  return lastRes;
}

module.exports = { postFirst, getFirst, patchFirst, deleteFirst };
