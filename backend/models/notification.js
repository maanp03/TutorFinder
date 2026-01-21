const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['session_request', 'session_accepted', 'session_rejected', 'session_cancelled'], required: true },
  message: { type: String, required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);


