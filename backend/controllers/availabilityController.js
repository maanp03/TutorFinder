const Availability = require('../models/availability');
const Tutor = require('../models/tutorProfile');

const upsertAvailability = async (req, res) => {
  try {
    const userId = req.user?.user?.id;
    const tutor = await Tutor.findOne({ user: userId });
    if (!tutor) return res.status(403).json({ msg: 'Only tutors can set availability' });
    const { weekday, slots } = req.body;
    if (weekday === undefined || !Array.isArray(slots)) {
      return res.status(400).json({ msg: 'weekday and slots are required' });
    }
    const normalized = slots.map(s => ({ startMinutes: Number(s.startMinutes), endMinutes: Number(s.endMinutes) }))
      .filter(s => Number.isFinite(s.startMinutes) && Number.isFinite(s.endMinutes) && s.endMinutes > s.startMinutes);
    const doc = await Availability.findOneAndUpdate(
      { tutor: tutor._id, weekday },
      { tutor: tutor._id, weekday, slots: normalized },
      { upsert: true, new: true }
    );
    return res.json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

const getAvailability = async (req, res) => {
  try {
    const { tutorId, weekday } = req.query;
    const filter = {};
    if (tutorId) filter.tutor = tutorId;
    if (weekday !== undefined) filter.weekday = Number(weekday);
    const docs = await Availability.find(filter);
    return res.json(docs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { upsertAvailability, getAvailability };


