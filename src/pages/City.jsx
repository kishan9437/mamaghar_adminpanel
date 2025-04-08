import React, { useEffect, useState } from 'react'
import { Button, InputGroup, Form, Table, Pagination, Modal } from 'react-bootstrap'
import CityAddModal from '../components/CityAddModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';
import Swal from 'sweetalert2';
import EditCityModal from '../components/EditCityModal';
import { FaMapMarkerAlt, FaTrash } from 'react-icons/fa';

function City() {
    const [showModal, setShowModal] = useState(false);
    const [citys, setCitys] = React.useState([]);
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
    const [selectedLanguage, setSelectedLanguage] = useState('en');
    const [modalLanguage, setModalLanguage] = useState('en'); // 🔥 Independent modal language
    const [editingCity, setEditingCity] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const navigate = useNavigate();

    const fetchCity = async () => {
        try {
            setLoading(true);
            const { page, limit } = pagination;

            const token = localStorage.getItem('token'); // or your token key

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_BASE_URL}/api/get-taluka`, {
                params: {
                    page,
                    limit,
                    sortBy: sortConfig.key,
                    sortOrder: sortConfig.direction,
                    search: searchTerm,
                    // type: selectedType,
                },
                headers: {
                    'Authorization': `Bearer ${token}`, // Add authorization header
                    'Accept-Language': selectedLanguage,
                }
            });
            setCitys(response.data.data);
            setPagination(prev => ({
                ...prev,
                total: response.data.pagination.total,
                totalPages: response.data.pagination.totalPages,
            }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
            if (error.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login'); // Redirect to login page
            }
        } finally {
            setLoading(false);
        }
    }

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

    const handleDelete = async (cityId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You want to delete this city?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/taluka/${cityId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh the list
            fetchCity();
            Swal.fire({
                title: 'Deleted!',
                text: 'City deleted successfully.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch state');
            if (error.response?.status === 401) {
                Swal.fire({
                    title: 'Session Expired!',
                    text: 'Please log in again.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate('/login'); // Redirect to login
                });
            }
        }
    };

    const handleModalClose = () => {
        setShowEditModal(false);
        setEditingCity(null);
    };

    const handleUpdate = async (cityId, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_BASE_URL}/api/taluka/${cityId}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            if (response.data.success) {
                setCitys((prevSubCategories) =>
                    prevSubCategories.map((sub) =>
                        sub.id === cityId ? { ...sub, ...updatedData } : sub
                    )
                );
                alert('City updated successfully');
                setShowEditModal(false);
                await fetchCity()
                return { success: true };
            }
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
            if (error.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login'); // Redirect to login page
            }
        }
    };


    useEffect(() => {
        fetchCity();
    }, [pagination.page, pagination.limit, sortConfig, searchTerm, selectedLanguage]);

    return (
        <div className="m-1 mt-3 p-1">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-bold">City</h3>
                <Button
                    variant="primary"
                    onClick={() => setShowModal(true)}
                >
                    New
                </Button>
            </div>
            <div className='flex'>
                <div className='flex gap-2 mb-1'>
                    {/* Search Bar */}
                    <InputGroup className="mb-0" style={{ width: '300px' }}>
                        <InputGroup.Text>🔍</InputGroup.Text>
                        <Form.Control
                            placeholder="Search city..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </InputGroup>
                    <Form.Select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ width: '150px' }}>
                        <option value="en">English</option>
                        <option value="gu">ગુજરાતી</option>
                        <option value="hi">हिंदी</option>
                    </Form.Select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table striped bordered hover responsive className='pb-0'>
                    <thead>
                        <tr>
                            <th
                                onClick={() => handleSort('name')}
                                style={{ cursor: 'pointer' }}
                            >
                                Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            <th>
                                Polygon
                            </th>
                            <th
                            >
                                Total Users
                            </th>
                            <th>Post/Questions</th>
                            <th>Location</th>
                            <th>Languages</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="8" className="text-center text-danger py-4">{error}</td>
                            </tr>
                        ) : citys.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">No city found</td>
                            </tr>
                        ) : (
                            citys.map((city, index) => (
                                <tr key={city.id}>
                                    <td>{city.name}</td>
                                    <td></td>
                                    <td>{city.totaluser}</td>
                                    <td>{city.typeCount}</td>
                                    <td>
                                        <button
                                            onClick={() => {
                                                if (city.location === 'N/A') {
                                                    alert('Location data not available');
                                                    // or use alert('Location data not available');
                                                    return;
                                                }
                                                setSelectedLocation(city.location);
                                                setShowMapModal(true);
                                            }}
                                            className={`
                                                                                      p-2 rounded-full transition-all duration-200
                                                                                      ${city.location === 'N/A'
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700'
                                                }
                                                                                    `}
                                            title={city.location === 'N/A' ? 'Location unavailable' : 'View on map'}
                                        // disabled={state.location === 'N/A'}
                                        >
                                            <FaMapMarkerAlt className="text-lg" />
                                        </button>
                                    </td>
                                    <td>
                                        <div className='flex w-full gap-1 mb-1'>
                                            {['en', 'gu', 'hi'].map(lang => (
                                                <button
                                                    key={lang}
                                                    className={`px-2 py-1.5 rounded-md text-sm font-medium 
                          border border-blue-200 hover:bg-blue-200 transition-colors duration-200
                          ${modalLanguage === lang ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}`}
                                                    onClick={() => {
                                                        setEditingCity(city.id);
                                                        setModalLanguage(lang);
                                                        setShowEditModal(true);
                                                    }}
                                                >
                                                    {lang.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(city.id)}
                                            disabled={city.role === 'admin'}
                                            className="flex items-center justify-center gap-1 px-3 py-1.5"
                                        >
                                            <FaTrash className="text-sm" />
                                            <span className="sr-only">Delete</span> {/* Screen reader only text */}
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
                {/* Pagination */}
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

                {/* Rows Per Page Dropdown */}
                <Form.Select
                    as="select"
                    style={{ width: '150px' }}
                    value={pagination.limit}
                    onChange={(e) => setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                    className='mb-1'
                >
                    <option value="5">Data Show 5</option>
                    <option value="10">Data Show 10</option>
                    <option value="25">Data Show 25</option>
                    <option value="50">Data Show 50</option>
                </Form.Select>
            </div>

            <CityAddModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                refreshData={fetchCity}
            />

            {editingCity && (
                <EditCityModal
                    show={showEditModal}
                    handleClose={handleModalClose}
                    cityId={editingCity}
                    onUpdate={handleUpdate}
                    selectedLanguage={modalLanguage}
                />
            )}

            {/* Map Modal */}
            <Modal show={showMapModal} onHide={() => setShowMapModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Location Map</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedLocation && (
                        <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                            <iframe
                                width="100%"
                                height="100%"
                                frameBorder="0"
                                scrolling="no"
                                marginHeight="0"
                                marginWidth="0"
                                src={`https://maps.google.com/maps?q=${selectedLocation}&z=8&output=embed`}
                                title="Location Map"
                            >
                            </iframe>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMapModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

        </div>
    )
}

export default City;
