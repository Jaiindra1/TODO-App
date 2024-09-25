import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({ token }) => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState('');

    const fetchProfile = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/user/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Error fetching profile');
        }
    };

    useEffect(() => {
        fetchProfile(); // Fetch profile on component mount
    }, []);

    return (
        <div>
            <h2>User Profile</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {profile ? (
                <div>
                    <p>Name: {profile.name}</p>
                    <p>Email: {profile.email}</p>
                </div>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
};

export default Profile;
