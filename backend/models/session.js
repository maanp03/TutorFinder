const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
});

module.exports = mongoose.model('Session', SessionSchema);
