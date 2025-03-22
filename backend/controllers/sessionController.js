const Session = require('../models/session');

const bookSession = async (req, res) => {
  const { tutorId, clientId, date, duration } = req.body;
  if (!tutorId || !clientId || !date || !duration) {
    return res.status(400).json({ msg: 'All fields are required' });
  }
  try {
    const session = new Session({
      tutor: tutorId,   
      client: clientId, 
      date,
      duration,
    });
    await session.save();
    return res.json(session);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};


const getSessions = async (req, res) => {
  try {
    const { tutorId, clientId } = req.query;
    const filter = {};
    if (tutorId) filter.tutor = tutorId;  
    if (clientId) filter.client = clientId; 


    const sessions = await Session.find(filter)
      .populate('tutor', 'name')    
      .populate('client', 'name');  

    return res.json(sessions);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
};

module.exports = { bookSession, getSessions };
