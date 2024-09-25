import React, { useState } from 'react';
import axios from 'axios';

const TodoForm = ({ setTodos, token }) => {
    const [title, setTitle] = useState('');
    const [status, setStatus] = useState('pending');
    const [error, setError] = useState('');

    const handleAddTodo = async (e) => {
        e.preventDefault();

        if (!title || !status) {
            setError('Title and status are required');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/todos', {
                title,
                status,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`, // Ensure this token is valid
                },
            });

            // Update your todo state here
            setTodos(prevTodos => [...prevTodos, response.data]);
            setTitle(''); // Reset title input
            setStatus('pending'); // Reset status input
        } catch (error) {
            console.error('Error adding todo:', error.response ? error.response.data : error.message);
            setError(` todo is successfully created`);
        }
    };

    return (
        <form onSubmit={handleAddTodo}>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Todo Title"
                required
            />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
            </select>
            <button type="submit">Add Todo</button>
            {error && <p>{error}</p>}
        </form>
    );
};

export default TodoForm;
