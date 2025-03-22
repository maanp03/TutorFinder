const User = require('../models/user');
const Tutor = require('../models/tutorProfile');


const createTutorProfile = async (req, res) => {
  const { name, bio, subjects } = req.body;
  const userId = req.user?.user?.id;

  if (!userId) {
    return res.status(400).json({ msg: 'User not authenticated properly' });
  }

  try {
  
    const user = await User.findById(userId);
    if (!user || user.role !== 'tutor') {
      return res.status(400).json({ msg: 'Invalid tutor ID' });
    }

  
    let tutorProfile = await Tutor.findOne({ user: userId });
    if (!tutorProfile) {
      tutorProfile = new Tutor({
        user: userId,
        name,
        bio,
        subjects,
      });
    } else {
      tutorProfile.name = name;
      tutorProfile.bio = bio;
      tutorProfile.subjects = subjects;
    }

    await tutorProfile.save();
    return res.json(tutorProfile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

const getTutorProfile = async (req, res) => {
  try {
    const tutorProfile = await Tutor.findOne({ user: req.params.userId })
      .populate('user', ['name', 'email']);

    if (!tutorProfile) {
      return res.status(400).json({ msg: 'Tutor profile not found' });
    }
    return res.json(tutorProfile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find().populate('user', ['name', 'email']);
    return res.json(tutors);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = {
  createTutorProfile,
  getTutorProfile,
  getAllTutors,
};
