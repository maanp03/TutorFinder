const jwt = require('jsonwebtoken');

// Predefined admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: '123',
};

// Admin login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    // Generate JWT
    const payload = { user: { id: 'admin', role: 'admin' } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } else {
    res.status(400).json({ msg: 'Invalid credentials' });
  }
};

module.exports = { adminLogin };