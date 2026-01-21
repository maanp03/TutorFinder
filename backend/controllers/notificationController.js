const Notification = require('../models/notification');

const listNotifications = async (req, res) => {
  try {
    const userId = req.user?.user?.id;
    const docs = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    return res.json(docs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

const markRead = async (req, res) => {
  try {
    const userId = req.user?.user?.id;
    const { id } = req.params;
    const doc = await Notification.findOneAndUpdate({ _id: id, user: userId }, { read: true }, { new: true });
    if (!doc) return res.status(404).json({ msg: 'Notification not found' });
    return res.json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

const markAllRead = async (req, res) => {
  try {
    const userId = req.user?.user?.id;
    await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
    const docs = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    return res.json(docs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { listNotifications, markRead, markAllRead };


