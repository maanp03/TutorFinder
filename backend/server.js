const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tutorRoutes = require('./routes/tutorRoutes');
const clientRoutes = require('./routes/clientRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

dotenv.config();

const app = express();

app.use(cors());

connectDB();
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/sessions', sessionRoutes);


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
