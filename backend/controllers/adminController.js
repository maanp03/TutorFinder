const jwt = require('jsonwebtoken');
const Tutor = require('../models/tutorProfile');
const Client = require('../models/clientProfile');

const ADMIN_CREDENTIALS = {
  email: 'admin@exmail.com',
  password: '123'
};

const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    const payload = { user: { id: 'admin', role: 'admin', name: 'Administrator' } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({
        token,
        role: 'admin',
        userId: 'admin',
        name: 'Administrator'
      });
    });
  } else {
    res.status(400).json({ msg: 'Invalid credentials' });
  }
};

// Get all tutors
const getTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find().populate('user', ['name', 'email']);
    res.json(tutors);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get all clients
const getClients = async (req, res) => {
  try {
    const clients = await Client.find().populate('user', ['name', 'email']);
    res.json(clients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { adminLogin, getTutors, getClients };
