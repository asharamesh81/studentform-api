// index.js
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const db = mysql.createConnection({
  host: 'testdb.ce4mrcmxyo4a.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: '12345678',
  database: 'testdb',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Middleware
app.use(bodyParser.json());
app.use(cors())
// Routes
app.post('/api/signup', async (req, res) => {
  const { username, password, dob, email, mobile_number } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert user into database
  db.query(
    'INSERT INTO users (user_name, Password, dob, email, mobile_number) VALUES (?, ?, ?, ?, ?)',
    [username, hashedPassword, dob, email, mobile_number],
    (error, results) => {
      if (error) {
        console.error('Error signing up:', error);
        res.status(500).json({ message: 'Signup failed' });
      } else {
        res.status(201).json({ message: 'Signup successful' });
      }
    }
  );
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  // Retrieve user from database
  db.query(
    'SELECT * FROM users WHERE username = ?',
    [username],
    async (error, results) => {
      if (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Login failed' });
      } else if (results.length === 0) {
        res.status(401).json({ message: 'Invalid username or password' });
      } else {
        const user = results[0];

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          // Generate JWT token
          const token = jwt.sign({ userId: user.id }, 'secret_key');
          res.json({ token });
        } else {
          res.status(401).json({ message: 'Invalid username or password' });
        }
      }
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
