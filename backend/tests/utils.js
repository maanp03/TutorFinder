const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const User = require('../models/User');
const TutorProfile = require('../models/tutorProfile');

function uniq() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function createTutor() {
  const email = `tutor+${uniq()}@test.com`;
  const tutorUser = await User.create({
    name: 'Tutor Test',
    email,
    password: 'Pass1234',
    role: 'tutor'
  });

  try {
    await TutorProfile.create({
      user: tutorUser._id,
      name: 'Tutor Test',
      bio: 'Test bio',
      subjects: ['Math']
    });
  } catch (_) {}

  const token = jwt.sign(
    { id: tutorUser._id, role: 'tutor' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { tutorUser, token };
}

async function createClient() {
  const email = `client+${uniq()}@test.com`;
  const clientUser = await User.create({
    name: 'Client Test',
    email,
    password: 'Pass1234',
    role: 'client'
  });

  const token = jwt.sign(
    { id: clientUser._id, role: 'client' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { clientUser, token };
}

function oid(id) {
  return new mongoose.Types.ObjectId(id);
}

module.exports = { createTutor, createClient, oid };
