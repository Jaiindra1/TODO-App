const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const router = express.Router();

// Get user profile
router.get('/profile', (req, res) => {
    db.get('SELECT name, email FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) return res.status(500).send('Error fetching profile');
        res.json(user);
    });
});

// Update user profile
router.put('/profile', (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
    const updateQuery = password
        ? 'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?'
        : 'UPDATE users SET name = ?, email = ? WHERE id = ?';
    
    const params = password ? [name, email, hashedPassword, req.user.id] : [name, email, req.user.id];

    db.run(updateQuery, params, function(err) {
        if (err) return res.status(500).send('Error updating profile');
        res.send('Profile updated');
    });
});

module.exports = router;
