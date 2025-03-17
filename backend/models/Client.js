const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String, required: true },
  gradeLevel: { type: String, required: true },
  subjects: [{ type: String }],
});

module.exports = mongoose.model('Client', ClientSchema);
