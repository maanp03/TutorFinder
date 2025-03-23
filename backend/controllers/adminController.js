
const jwt = require('jsonwebtoken');
const Tutor = require('../models/tutorProfile');
const Client = require('../models/clientProfile');
const User = require('../models/user');
const Session = require('../models/session');

const ADMIN_CREDENTIALS = {
  email: 'admin@exmail.com',
  password: '123'
};

// Admin login
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



//Iteration 2 

// Delete a tutor data
const deleteTutor = async (req, res) => {
  const { tutorId } = req.params;

  try {
    
    const tutor = await Tutor.findById(tutorId);
    if (!tutor) {
      return res.status(404).json({ msg: 'Tutor not found' });
    }

   
    await User.findByIdAndDelete(tutor.user);


    await Tutor.findByIdAndDelete(tutorId);


    await Session.deleteMany({ tutor: tutorId });

    res.json({ msg: 'Tutor and all associated data deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Delete a client associated data
const deleteClient = async (req, res) => {
  const { clientId } = req.params;

  try {
    
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    
    await User.findByIdAndDelete(client.user);

    
    await Client.findByIdAndDelete(clientId);

   
    await Session.deleteMany({ client: clientId });

    res.json({ msg: 'Client and all associated data deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  adminLogin,
  getTutors,
  getClients,
  deleteTutor,
  deleteClient,
};
