const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  grade: { type: Number, required: true }
});

module.exports = mongoose.model('Client', ClientSchema);
