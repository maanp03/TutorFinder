const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor', required: true, index: true },
  // ISO weekday 0-6, 0 = Sunday
  weekday: { type: Number, min: 0, max: 6, required: true },
  // time ranges in minutes since 00:00, e.g., 9:30 => 570
  slots: [{
    startMinutes: { type: Number, required: true },
    endMinutes: { type: Number, required: true }
  }],
});

module.exports = mongoose.model('Availability', AvailabilitySchema);


