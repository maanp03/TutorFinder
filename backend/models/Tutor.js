const mongoose = require('mongoose');

const TutorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String, required: true },
  subjects: [{ type: String }],
  experience: { type: String, required: true },
});

module.exports = mongoose.model('Tutor', TutorSchema);
