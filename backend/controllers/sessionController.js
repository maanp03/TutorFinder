const Session = require("../models/session");
const Availability = require("../models/availability");
const Notification = require("../models/notification");
const Tutor = require("../models/tutorProfile");
const Client = require("../models/clientProfile");
const mongoose = require("mongoose");

const bookSession = async (req, res) => {
  const { tutorId, clientId, date, duration } = req.body;
  if (!tutorId || !clientId || !date || !duration) {
    return res.status(400).json({ msg: "All fields are required" });
  }
  try {
    // Check availability
    const start = new Date(date);
    const end = new Date(start.getTime() + duration * 60000);
    const weekday = start.getDay();
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();

    const availability = await Availability.findOne({
      tutor: tutorId,
      weekday,
    });
    const isAvailable = availability?.slots?.some(
      (s) => startMinutes >= s.startMinutes && endMinutes <= s.endMinutes
    );
    if (!isAvailable) {
      return res
        .status(400)
        .json({ msg: "Tutor not available at the requested time" });
    }

    const session = new Session({
      tutor: tutorId,
      client: clientId,
      date,
      duration,
      status: "pending",
    });
    await session.save();
    // Notify tutor of request (target their User id)
    const tutorDoc = await Tutor.findById(tutorId);
    if (tutorDoc?.user) {
      await Notification.create({
        user: tutorDoc.user,
        type: "session_request",
        message: "New session request received",
        session: session._id,
      });
    }
    return res.json(session);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

const getSessions = async (req, res) => {
  try {
    const { tutorId, clientId } = req.query;
    const filter = {};
    if (tutorId) filter.tutor = tutorId;
    if (clientId) filter.client = clientId;

    const sessions = await Session.find(filter)
      .populate("tutor", "name")
      .populate("client", "name");

    return res.json(sessions);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

// Tutor accepts a session
const acceptSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body || {};
    const objectId = new mongoose.Types.ObjectId(id);

    const session = await Session.findByIdAndUpdate(
      objectId,
      { status: "accepted" },
      { new: true }
    );
    if (!session) return res.status(404).json({ msg: "Session not found" });
    const clientDoc = await Client.findById(session.client);
    if (clientDoc?.user) {
      await Notification.create({
        user: clientDoc.user,
        type: "session_accepted",
        message: message ? `Accepted: ${message}` : "Your session was accepted",
        session: session._id,
      });
    }
    return res.json(session);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

// Tutor rejects a session
const rejectSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body || {};
    const objectId = new mongoose.Types.ObjectId(id);
    const session = await Session.findByIdAndUpdate(
      objectId,
      { status: "rejected" },
      { new: true }
    );
    if (!session) return res.status(404).json({ msg: "Session not found" });
    const clientDoc = await Client.findById(session.client);
    if (clientDoc?.user) {
      await Notification.create({
        user: clientDoc.user,
        type: "session_rejected",
        message: message ? `Rejected: ${message}` : "Your session was rejected",
        session: session._id,
      });
    }
    return res.json(session);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

// Client cancels a session
const cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findByIdAndUpdate(
      id,
      { status: "cancelled" },
      { new: true }
    );
    if (!session) return res.status(404).json({ msg: "Session not found" });
    const tutorDoc = await Tutor.findById(session.tutor);
    if (tutorDoc?.user) {
      await Notification.create({
        user: tutorDoc.user,
        type: "session_cancelled",
        message: "A session was cancelled",
        session: session._id,
      });
    }
    return res.json(session);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server error");
  }
};

module.exports = {
  bookSession,
  getSessions,
  acceptSession,
  rejectSession,
  cancelSession,
};
