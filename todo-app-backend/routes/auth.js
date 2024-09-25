const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const router = express.Router();

// Signup route
router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    db.run('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', 
    [userId, name, email, hashedPassword], function(err) {
    if (err) {
        console.error('User creation failed:', err);  // Log the actual error
        return res.status(500).send('User creation failed');
    }
    res.status(201).send('User created successfully');
});
});

// Login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(400).send('Invalid credentials');
        }
        const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });
        res.json({ token });
    });
});

module.exports = router;
