const User = require('../models/User');
const Tutor = require('../models/Tutor');

// Create Tutor Profile
const createTutorProfile = async (req, res) => {
  const { userId, bio, subjects, experience } = req.body;

  try {
    // Check if user exists and is a tutor
    const user = await User.findById(userId);
    if (!user || user.role !== 'tutor') {
      return res.status(400).json({ msg: 'Invalid tutor ID' });
    }

    // Create tutor profile
    const tutorProfile = new Tutor({
      user: userId,
      bio,
      subjects,
      experience,
    });

    await tutorProfile.save();
    res.json(tutorProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get Tutor Profile
const getTutorProfile = async (req, res) => {
  try {
    const tutorProfile = await Tutor.findOne({ user: req.params.userId }).populate('user', ['name', 'email']);
    if (!tutorProfile) {
      return res.status(400).json({ msg: 'Tutor profile not found' });
    }
    res.json(tutorProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { createTutorProfile, getTutorProfile };
