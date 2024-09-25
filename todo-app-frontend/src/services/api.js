import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = {
    login: (email, password) => axios.post(`${API_URL}/auth/login`, { email, password }),
    signup: (name, email, password) => axios.post(`${API_URL}/auth/signup`, { name, email, password }),
    getTodos: (token) => axios.get(`${API_URL}/todos`, { headers: { Authorization: `Bearer ${token}` } }),
    createTodo: (todo, token) => axios.post(`${API_URL}/todos`, todo, { headers: { Authorization: `Bearer ${token}` } }),
    deleteTodo: (id, token) => axios.delete(`${API_URL}/todos/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
    getProfile: (token) => axios.get(`${API_URL}/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
    updateProfile: (profile, token) => axios.put(`${API_URL}/user/profile`, profile, { headers: { Authorization: `Bearer ${token}` } })
};

export default api;
