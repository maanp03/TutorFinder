const mongoose = require('mongoose');

const TutorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  bio: { type: String, required: true },
  subjects: [{ type: String }],
});

module.exports = mongoose.models.Tutor || mongoose.model('Tutor', TutorSchema);
