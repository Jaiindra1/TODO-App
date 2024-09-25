const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const router = express.Router();

// Get all todos for the authenticated user
router.get('/', (req, res) => {
    db.all('SELECT * FROM todos WHERE user_id = ?', [req.user.id], (err, todos) => {
        if (err) return res.status(500).send('Error fetching todos');
        res.json(todos);
    });
});

// Create a new todo
router.post('/', (req, res) => {
    const { title, description, status } = req.body;
    const todoId = uuidv4();
    db.run('INSERT INTO todos (id, user_id, title, description, status) VALUES (?, ?, ?, ?, ?)',
           [todoId, req.user.id, title, description, status],
           function(err) {
        if (err) return res.status(500).send('Error creating todo');
        res.status(201).send('Todo created');
    });
});

// Update a todo
router.put('/:id', (req, res) => {
    const { title, description, status } = req.body;
    db.run('UPDATE todos SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
           [title, description, status, req.params.id, req.user.id],
           function(err) {
        if (err) return res.status(500).send('Error updating todo');
        res.send('Todo updated');
    });
});

// Delete a todo
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], function(err) {
        if (err) return res.status(500).send('Error deleting todo');
        res.send('Todo deleted');
    });
});

module.exports = router;
