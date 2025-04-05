import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Table, Spinner, Alert } from 'react-bootstrap';
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';

const UserPost = () => {
    const { userId } = useParams(); // Get the user ID from the URL
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error("No authentication token found.");
                    return;
                }
                const response = await axios.get(`${API_BASE_URL}/api/postbyuser/${userId}`);
                setPosts(response.data.data || []);
            } catch (err) {
                console.error('Error fetching data:', error.response?.data?.message || error.message);
                if (error.response?.status === 401) {
                    alert('Session expired. Please log in again.');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUserPosts();
    }, [userId, navigate]);

    return (
        <div className="user-posts-container">
            <h3 className="posts-header">User Posts</h3>

            {loading && (
                <div className="loading-spinner">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}

            {error && (
                <Alert variant="danger" className="error-alert">
                    {error}
                </Alert>
            )}

            {!loading && !error && posts.length === 0 && (
                <p className="no-posts">No posts available.</p>
            )}

            <div className="posts-grid">
                {posts.map((post) => (
                    <div key={post._id} className="post-card">
                        {post.photoUrls && post.photoUrls.length > 0 && (
                            <img
                                src={`${API_BASE_URL}${post.photoUrls[0]}`}
                                alt={post.title}
                                className="post-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/mamaGhar.png';
                                }}
                            />
                        )}
                        <div className="post-content">
                            <h3 className="post-title">{post.title}</h3>
                            <p className="post-details">{post.details}</p>
                            <p className="post-price">
                                {post.price ? `₹${post.price}` : 'Price not specified'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserPost;
