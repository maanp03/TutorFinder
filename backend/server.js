const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const clientRoutes = require('./routes/clientRoutes');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes); // Auth routes (register, login)
app.use('/api/admin', adminRoutes); // Admin routes (admin login)
app.use('/api/tutor', tutorRoutes); // Tutor routes (create profile, get profile)
app.use('/api/client', clientRoutes); // Client routes (create profile, get profile)

// Landing Page Route
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Tutor Finder</h1>
    <ul>
      <li><a href="/api/auth/register">Register as Tutor/Client</a></li>
      <li><a href="/api/auth/login">Login as Tutor/Client</a></li>
      <li><a href="/api/admin/login">Admin Login</a></li>
    </ul>
  `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
