import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import TodoList from './components/TodoList';
import Profile from './components/Profile';
import './App.css';

function App() {
    const [token, setToken] = useState('');

    return (
        <div>
            {!token ? (
                <>
                    <Signup />
                    <Login setToken={setToken} />
                </>
            ) : (
                <>
                    <TodoList token={token} />
                    <Profile token={token} />
                </>
            )}
        </div>
    );
}

export default App;
