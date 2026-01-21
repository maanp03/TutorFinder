const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'cancelled'], default: 'pending' },
  cancelledBy: { type: String, enum: ['tutor', 'client', 'admin'], default: null },
  cancellationReason: { type: String, default: null },
  cancelledAt: { type: Date, default: null },
});

module.exports = mongoose.model('Session', SessionSchema);
