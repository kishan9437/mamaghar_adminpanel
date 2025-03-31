import React, { useEffect, useState } from 'react';
import { Table, Pagination, Modal, Form, InputGroup, Button, Image } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'desc' });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });
    const [selectedImage, setSelectedImage] = useState(null);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { page, limit } = pagination;

            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No authentication token found.");
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/users`, {
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

            setUsers(response.data.data || []);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination?.totalUsers || 0,
                totalPages: response.data.pagination?.totalPages || 1,
            }));
        } catch (error) {
            console.error('Error fetching data:', error.response?.data?.message || error.message);
            if (error.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login');
            }
        } finally {
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

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/delete-user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchUsers();
            alert('User deleted successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete user');
            if (err.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login');
            }
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, pagination.limit, sortConfig, searchTerm]);

    return (
        <div className="m-1 mt-3 p-1">
            <div className="flex justify-between items-center mb-4">
                <h3 className='text-2xl font-bold'>Users</h3>
            </div>

            <div className='flex gap-2'>
                <InputGroup className="mb-1" style={{ width: '300px' }}>
                    <InputGroup.Text>🔍</InputGroup.Text>
                    <Form.Control
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </InputGroup>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <Table striped bordered hover responsive className='pb-0'>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                                Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th onClick={() => handleSort('mobile')} style={{ cursor: 'pointer' }}>
                                Mobile {sortConfig.key === 'mobile' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th onClick={() => handleSort('address')} style={{ cursor: 'pointer' }}>
                                Address {sortConfig.key === 'address' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th onClick={() => handleSort('city')} style={{ cursor: 'pointer' }}>
                                City {sortConfig.key === 'city' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th onClick={() => handleSort('district')} style={{ cursor: 'pointer' }}>
                                District {sortConfig.key === 'district' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th onClick={() => handleSort('state')} style={{ cursor: 'pointer' }}>
                                State {sortConfig.key === 'state' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th onClick={() => handleSort('pinCode')} style={{ cursor: 'pointer' }}>
                                PinCode {sortConfig.key === 'pinCode' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th>Profile</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="9" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="9" className="text-center text-danger py-4">{error}</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="text-center py-4">No users found</td>
                            </tr>
                        ) : (
                            users.map((user, index) => (
                                <tr key={user._id}>
                                    <td>{(index + 1) + (pagination.page - 1) * (pagination.limit)}</td>
                                    <td>{user.name || 'N/A'}</td>
                                    <td>{user.mobile || 'N/A'}</td>
                                    <td>{user.address || 'N/A'}</td>
                                    <td>{user.city || 'N/A'}</td>
                                    <td>{user.district || 'N/A'}</td>
                                    <td>{user.state || 'N/A'}</td>
                                    <td>{user.pinCode || 'N/A'}</td>
                                    <td>
                                        {user.profilePicture ? (
                                            <Image
                                                src={user.profilePicture}
                                                alt="profilePic"
                                                width={50}
                                                height={50}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setSelectedImage(user.profilePicture)}
                                                roundedCircle
                                            />
                                        ) : "No Image"}
                                    </td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(user._id)}
                                            disabled={user.role === 'admin'} // Prevent deleting admin users
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

export default Users;