import React, { useEffect, useState } from 'react';
import { Table, Pagination, Modal, Form, InputGroup, Button, Image, Dropdown } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import EditUserModal from '../components/EditUserModal';
import UserReportModal from '../components/UserReportModal';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'desc' });
    const [selectedImage, setSelectedImage] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
    });
    const [states, setStates] = useState([]);
    const [selectedState, setSelectedState] = useState("");
    const [district, setDistrict] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const navigate = useNavigate();

    const handleShowReports = (userId) => {
        setSelectedUserId(userId);
        setModalShow(true);
    };

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
                    state: selectedState,
                    district: selectedDistrict
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

    const fetchStates = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/states`);

            setStates(response.data.data || []);
        } catch (error) {
            console.error('Error fetching states:', error.response?.data?.message || error.message);
        }
    };

    const fetchDistrict = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/district`);
            setDistrict(response.data.data || []);
        } catch (error) {
            console.error('Error fetching states:', error.response?.data?.message || error.message);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleStateChange = (e) => {
        setSelectedState(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    };

    const handleDistrictChange = (e) => {
        setSelectedDistrict(e.target.value);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
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

    const handleBlockUser = async (userId) => {
        if (!window.confirm('Are you sure you want to block this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/block-user/${userId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            fetchUsers();
            alert('User blocked successfully');
        } catch (error) {
            console.error('Error blocking user:', error);
        }
    };
    useEffect(() => {
        fetchStates();
        fetchDistrict();
        fetchUsers();
    }, [pagination.page, pagination.limit, sortConfig, searchTerm, selectedState, selectedDistrict]);

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
                <Form.Select className='mb-1' style={{ width: '150px' }} value={selectedState} onChange={handleStateChange}>
                    <option value="">Select State</option>
                    {states.map((state, index) => (
                        <option key={index} value={state}>{state}</option>
                    ))}
                </Form.Select>
                <Form.Select className='mb-1' style={{ width: '150px' }} value={selectedDistrict} onChange={handleDistrictChange}>
                    <option value="">Select District</option>
                    {district.map((district, index) => (
                        <option key={index} value={district}>{district}</option>
                    ))}
                </Form.Select>
            </div>

            {/* Users Table */}
            {/* <div className="overflow-x-auto"> */}
            <Table striped bordered hover responsive className='pb-0'>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                            Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                        </th>
                        <th>Total Posts</th>
                        <th>Total Questions</th>
                        <th>Last Action</th>
                        <th>Reports</th>
                        {/* <th>Status</th> */}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="7" className="text-center py-4">Loading...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan="7" className="text-center text-danger py-4">{error}</td>
                        </tr>
                    ) : users.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="text-center py-4">No users found</td>
                        </tr>
                    ) : (
                        users.map((user, index) => (
                            <tr key={user._id}>
                                <td>
                                    <div className='flex items-center'>
                                        <div className='flex flex-col'>
                                            <Image
                                                src={user.profilePi || '/mamaGhar.png'}
                                                width={40}
                                                height={40}
                                                roundedCircle
                                            />
                                        </div>
                                        <div className='ml-2'>
                                            <span className=''>{user.name}</span>
                                            <div className="flex items-center">
                                                <span className="text-gray-500 text-sm">
                                                    {[
                                                        user.state || 'N/A',
                                                        user.district || 'N/A',
                                                        user.address || 'N/A'
                                                    ].filter(Boolean).join(', ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (user.totalPosts > 0) {
                                            window.open(`${window.location.origin}/user-posts/${user._id}`, '_blank', 'noopener,noreferrer');
                                        } else {
                                            alert('This user has not created any posts yet.');
                                        }
                                    }}
                                >
                                    {user.totalPosts > 0 ? (
                                        <span className="no-underline text-black">{user.totalPosts}</span>
                                    ) : (
                                        <span className="text-gray-500">{user.totalPosts}</span>
                                    )}
                                </td>
                                <td
                                    className="cursor-pointer"
                                    onClick={() => {
                                        if (user.totalQuestions > 0) {
                                            window.open(`${window.location.origin}/user-questions/${user._id}`, '_blank', 'noopener,noreferrer');
                                        } else {
                                            alert('This user has not created any question yet.');
                                        }
                                    }}
                                >
                                    {user.totalQuestions > 0 ? (
                                        <span className="no-underline text-black">{user.totalQuestions}</span>
                                    ) : (
                                        <span className="text-gray-500">{user.totalQuestions}</span>
                                    )}
                                </td>
                                <td>{user.lastAction?.type || 'N/A'}</td>
                                <td><Button
                                    variant="info"
                                    size="sm"
                                    onClick={() => handleShowReports(user._id)}
                                >
                                    View
                                </Button></td>
                                {/* <td>{user.status}</td> */}
                                <td>
                                    {/* <Dropdown>
                                        <Dropdown.Toggle variant="secondary" size="sm">Actions</Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <Dropdown.Item href={`/edit-user/${user._id}`}>Edit</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleBlockUser(user._id)}>Block</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown> */}
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedUser(user);
                                            setShowEditModal(true);
                                        }}
                                        className="me-2"
                                    >
                                        Edit
                                    </Button>
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
            {/* </div> */}

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

            {/* Edit Modal */}
            <EditUserModal
                show={showEditModal}
                handleClose={() => setShowEditModal(false)}
                userData={selectedUser}
                refreshUsers={fetchUsers}
            />

            {/* Report Modal */}
            <UserReportModal
                show={modalShow}
                userId={selectedUserId}
                onHide={() => setModalShow(false)}
            />
        </div>
    );
};

export default Users;