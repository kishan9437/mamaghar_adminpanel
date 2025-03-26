import React, { useEffect, useState } from 'react';
import { Table, Pagination, Modal, Form, InputGroup, Button, Image } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'desc' });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();

    const fetchPosts = async () => {
        try {
            setLoading(true);
            // setError('');
            const { page, limit } = pagination;

            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No authentication token found.");
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/posts`, {
                params: {
                    page,
                    limit,
                    sortBy: sortConfig.key,
                    sortOrder: sortConfig.direction,
                    search: searchTerm,
                },
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setPosts(response.data.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination?.totalPosts || 0,
                totalPages: response.data.pagination?.totalPages || 1,
            }));
        } catch (error) {
            console.error('Error fetching data:', error.response?.data?.message || error.message);
            if (error.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login'); // Redirect to login page
            }
        }
        finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/delete-posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchPosts();
            alert('Post deleted successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete post');
            if (err.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [pagination.page, pagination.limit, sortConfig, searchTerm]);

    return (
        <div className="container mt-4">
            <h3 className='mb-6'>Posts</h3>

            <div className='flex gap-2'>
                <InputGroup className="mb-1" style={{ width: '300px' }}>
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <Form.Control
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </InputGroup>
            </div>

            {/* Posts Table */}
            <div className="overflow-x-auto">
                <Table striped bordered hover responsive className='pb-0'>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                                Title {sortConfig.key === 'title' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th onClick={() => handleSort('price')} style={{ cursor: 'pointer' }}>
                                Price {sortConfig.key === 'price' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th>Details</th>
                            <th>Photo</th>
                            <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                                Created At {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="6" className="text-center text-danger py-4">{error}</td>
                            </tr>
                        ) : posts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-4">No posts found</td>
                            </tr>
                        ) : (
                            posts.map(post => (
                                <tr key={post._id}>
                                    <td>{post.title}</td>
                                    <td>{post.price}</td>
                                    <td>{post.details}</td>
                                    <td>
                                        {post.photoUrls?.length > 0 ? (
                                            <Image
                                                src={post.photoUrls[0]}
                                                alt="Post"
                                                width={50}
                                                height={50}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setSelectedImage(post.photoUrls[0])}
                                                rounded
                                            />
                                        ) : "No Image"}
                                    </td>
                                    <td>{new Date(post.createdAt).toLocaleString()}</td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(post._id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            {/* Pagination */}
            {/* Pagination */}
            <div className='flex justify-between items-center'>
                <Pagination className='mb-0'>
                    <Pagination.First
                        onClick={() => handlePageChange(1)}
                        disabled={pagination.page === 1}
                    />
                    <Pagination.Prev
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                    />
                    {[...Array(Math.min(5, pagination.totalPages)).keys()].map(num => {
                        const pageNum = num + 1;
                        return (
                            <Pagination.Item
                                key={pageNum}
                                active={pageNum === pagination.page}
                                onClick={() => handlePageChange(pageNum)}
                            >
                                {pageNum}
                            </Pagination.Item>
                        );
                    })}
                    <Pagination.Next
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                    />
                    <Pagination.Last
                        onClick={() => handlePageChange(pagination.totalPages)}
                        disabled={pagination.page === pagination.totalPages}
                    />
                </Pagination>

                <Form.Select
                    style={{ width: '150px' }}
                    value={pagination.limit}
                    onChange={(e) => setPagination(prev => ({
                        ...prev,
                        limit: Number(e.target.value),
                        page: 1
                    }))}
                    className='mb-1'
                >
                    <option value="5">Data Show 5</option>
                    <option value="10">Data Show 10</option>
                    <option value="25">Data Show 25</option>
                    <option value="50">Data Show 50</option>
                </Form.Select>
            </div>

            {/* Image Modal */}
            <Modal show={selectedImage !== null} onHide={() => setSelectedImage(null)} centered>
                <Modal.Body className="text-center">
                    <Image src={selectedImage} alt="Full Size" fluid />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Posts;
