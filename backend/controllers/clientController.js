const User = require('../models/User');
const Client = require('../models/clientProfile');

const createOrUpdateClientProfile = async (req, res) => {
  const { name, grade } = req.body;
  const userId = req.user?.user?.id;

  if (!userId) {
    return res.status(400).json({ msg: 'User not authenticated properly' });
  }

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'client') {
      return res.status(400).json({ msg: 'Invalid client ID or role' });
    }

    let clientProfile = await Client.findOne({ user: userId });

    if (!clientProfile) {
      clientProfile = new Client({
        user: userId,
        name,
        grade,
      });
    } else {
      clientProfile.name = name;
      clientProfile.grade = grade;
    }

    await clientProfile.save();
    return res.json(clientProfile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

const getClientProfile = async (req, res) => {
  const userId = req.params.userId;
  try {
    const clientProfile = await Client.findOne({ user: userId });
    if (!clientProfile) {
      return res.status(404).json({ msg: 'Client profile not found' });
    }
    return res.json(clientProfile);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};
//client delete account
const deleteAccount = async (req, res) => {
  const userId = req.user?.user?.id;

  if (!userId) {
    return res.status(400).json({ msg: 'User not authenticated properly' });
  }

  try {
    // Verify user is a client
    const user = await User.findById(userId);
    if (!user || user.role !== 'client') {
      return res.status(400).json({ msg: 'Invalid client ID' });
    }

    // Find client profile
    const client = await Client.findOne({ user: userId });
    if (!client) {
      return res.status(404).json({ msg: 'Client not found' });
    }

    // Import Session model for cascade deletion
    const Session = require('../models/session');

    // Delete user account first
    await User.findByIdAndDelete(userId);

    // Delete client profile
    await Client.findByIdAndDelete(client._id);

    // Delete all sessions associated with this client
    await Session.deleteMany({ client: client._id });

    res.json({ msg: 'Client and all associated data deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { createOrUpdateClientProfile, getClientProfile, deleteAccount };
