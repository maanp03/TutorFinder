const Session = require("../models/session");
const Availability = require("../models/availability");
const Notification = require("../models/notification");
const Tutor = require("../models/tutorProfile");
const Client = require("../models/clientProfile");
const mongoose = require("mongoose");

const getAuthUser = (req) => {
  const raw = req.user?.user ?? req.user;
  if (!raw) return {};
  const id = raw.id || raw._id || raw.userId;
  return {
    id: id ? id.toString() : undefined,
    role: raw.role,
    name: raw.name,
  };
};

const buildCancellationMessage = (actor, reason) => {
  let base = "A session was cancelled";
  if (actor === "admin") {
    base = "An administrator cancelled the session";
  } else if (actor === "tutor") {
    base = "The tutor cancelled the session";
  } else if (actor === "client") {
    base = "The client cancelled the session";
  }

  return reason ? `${base}. Reason: ${reason}` : base;
};

const notifyCancellationParticipants = async (
  session,
  actor,
  reason,
  tutorDoc,
  clientDoc
) => {
  const notifications = [];
  const message = buildCancellationMessage(actor, reason);

  if (tutorDoc?.user && actor !== "tutor") {
    notifications.push({
      user: tutorDoc.user,
      type: "session_cancelled",
      message,
      session: session._id,
    });
  }

  if (clientDoc?.user && actor !== "client") {
    notifications.push({
      user: clientDoc.user,
      type: "session_cancelled",
      message,
      session: session._id,
    });
  }

  if (notifications.length) {
    await Notification.insertMany(notifications);
  }
};

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

// Client/Tutor/Admin cancels a session
const cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body || {};
    const authUser = getAuthUser(req);

    if (!authUser?.id || !authUser?.role) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ msg: "Session not found" });

    const [tutorDoc, clientDoc] = await Promise.all([
      Tutor.findById(session.tutor),
      Client.findById(session.client),
    ]);

    const tutorUserId = tutorDoc?.user?.toString();
    const clientUserId = clientDoc?.user?.toString();

    let actor = null;
    if (authUser.role === "admin") {
      actor = "admin";
    } else if (
      authUser.role === "tutor" &&
      tutorUserId &&
      tutorUserId === authUser.id
    ) {
      actor = "tutor";
    } else if (
      authUser.role === "client" &&
      clientUserId &&
      clientUserId === authUser.id
    ) {
      actor = "client";
    }

    if (!actor) {
      return res
        .status(403)
        .json({ msg: "Not authorized to cancel this session" });
    }

    if (session.status === "cancelled") {
      return res.json(session);
    }

    session.status = "cancelled";
    session.cancelledBy = actor;
    session.cancellationReason = reason || null;
    session.cancelledAt = new Date();
    await session.save();

    await notifyCancellationParticipants(session, actor, reason, tutorDoc, clientDoc);

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
