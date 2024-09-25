const express = require('express');
const path = require("path");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { open } = require("sqlite");
const sqlite3 = require('sqlite3');

// Initialize express app
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());

// Initialize and connect to SQLite database
const db = new sqlite3.Database('./mydatabase.sqlite3', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT,
            description TEXT,
            status TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    `);
});

// Secret key for JWT
const JWT_SECRET = 'your_secret_key';

// Routes

// Signup route
// Signup route
app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;

    console.log('Signup request received:', { name, email, password });

    // Check if the user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
            console.error('Database error during user lookup:', err.message);
            return res.status(500).send('Database error. Please try again.');
        }

        if (row) {
            console.log('User already exists with email:', email);
            return res.status(400).send('User already exists');
        }

        // Hash the password
        const hashedPassword = bcrypt.hashSync(password, 10);
        console.log('Password hashed successfully:', hashedPassword);
        const userId = uuidv4();

        // Insert new user into database
        db.run('INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)', 
            [userId, name, email, hashedPassword], function(err) {
            if (err) {
                console.error('Database error during user insert:', err.message);
                return res.status(500).send('Error signing up. Please try again.');
            }
            console.log('User inserted successfully');
            res.status(201).send('User created successfully');
        });
    });
});


// Login route
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (!user) {
            return res.status(400).send('Invalid email or password');
        }

        // Compare password
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(400).send('Invalid email or password');
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(403).send('Token is required');
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('Invalid token');
        }
        req.userId = decoded.id;  // Set the user ID for use in the next middleware or route
        next();
    });
};

// Get profile (Authenticated route)
app.get('/api/profile', authenticateToken, (req, res) => {
    db.get('SELECT name, email FROM users WHERE id = ?', [req.userId], (err, user) => {
        if (err) {
            return res.status(500).send('Error fetching user profile');
        }
        res.json(user);
    });
});

// Update profile (Authenticated route)
app.put('/api/profile', authenticateToken, (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', 
        [name, email, hashedPassword, req.userId], function(err) {
        if (err) {
            return res.status(500).send('Error updating profile');
        }
        res.send('Profile updated successfully');
    });
});

// Todo routes (Authenticated)

// Get all todos
app.get('/api/todos', authenticateToken, (req, res) => {
    db.all('SELECT * FROM todos WHERE user_id = ?', [req.userId], (err, todos) => {
        if (err) {
            return res.status(500).send('Error fetching todos');
        }
        res.json(todos);
    });
});

// Create a new todo
app.post('/api/todos', authenticateToken, (req, res) => {
    const { title, description, status } = req.body;
    const todoId = uuidv4();

    db.run('INSERT INTO todos (id, user_id, title, description, status) VALUES (?, ?, ?, ?, ?)',
        [todoId, req.userId, title, description, status], function(err) {
        if (err) {
            return res.status(500).send('Error creating todo');
        }
        res.status(201).send('Todo created successfully');
    });
});

// Update a todo
app.put('/api/todos/:id', authenticateToken, (req, res) => {
    const { title, description, status } = req.body;
    const todoId = req.params.id;

    db.run('UPDATE todos SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?', 
        [title, description, status, todoId, req.userId], function(err) {
        if (err) {
            return res.status(500).send('Error updating todo');
        }
        res.send('Todo updated successfully');
    });
});

// Delete a todo
app.delete('/api/todos/:id', authenticateToken, (req, res) => {
    const todoId = req.params.id;

    db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [todoId, req.userId], function(err) {
        if (err) {
            return res.status(500).send('Error deleting todo');
        }
        res.send('Todo deleted successfully');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
