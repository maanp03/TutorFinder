const User = require('../models/User');
const Client = require('../models/Client');

// Create Client Profile
const createClientProfile = async (req, res) => {
  const { userId, bio, gradeLevel, subjects } = req.body;

  try {
    // Check if user exists and is a client
    const user = await User.findById(userId);
    if (!user || user.role !== 'client') {
      return res.status(400).json({ msg: 'Invalid client ID' });
    }

    // Create client profile
    const clientProfile = new Client({
      user: userId,
      bio,
      gradeLevel,
      subjects,
    });

    await clientProfile.save();
    res.json(clientProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Client Profile
const getClientProfile = async (req, res) => {
  try {
    const clientProfile = await Client.findOne({ user: req.params.userId }).populate('user', ['name', 'email']);
    if (!clientProfile) {
      return res.status(400).json({ msg: 'Client profile not found' });
    }
    res.json(clientProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { createClientProfile, getClientProfile };
