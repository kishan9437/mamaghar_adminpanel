import React, { useEffect, useState } from 'react'
import { Button, InputGroup, Form, Table, Pagination } from 'react-bootstrap'
import DistrictAddModal from '../components/DistrictAddModal';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

function District() {
    const [showModal, setShowModal] = useState(false);
    const [districts, setDistricts] = React.useState([]);
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
    const navigate = useNavigate();

    const fetchDistrict = async () => {
        try {
            setLoading(true);
            const { page, limit } = pagination;

            const token = localStorage.getItem('token'); // or your token key

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_BASE_URL}/api/get-districts`, {
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
            setDistricts(response.data.data);
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

    const handleDelete = async (districtId) => {
        if (!window.confirm('Are you sure you want to delete this district?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_BASE_URL}/api/district/${districtId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Refresh the list
            fetchDistrict();
            alert('district deleted successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch state');
            if (error.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login'); // Redirect to login page
            }
        }
    };

    useEffect(() => {
        fetchDistrict();
    }, [pagination.page, pagination.limit, sortConfig, searchTerm, selectedLanguage]);

    return (
        <div className="m-1 mt-3 p-1">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-bold">District</h3>
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
                            placeholder="Search District..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </InputGroup>
                    <Form.Select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ width: '150px' }}>
                        <option value="en">English</option>
                        <option value="gu">ગુજરાતી</option>
                        <option value="hi">हिंदी</option>
                    </Form.Select>

                    {/* <Form.Select style={{ width: '150px' }}>
                                    <option value="">Select State</option>
                                </Form.Select> */}
                </div>
                {/* <div className='flex w-full justify-end gap-2 mb-1'>
                    {['en', 'gu', 'hi'].map(lang => (
                        <button
                            key={lang}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium 
                          ${modalLanguage === lang ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'} 
                          border border-blue-200 hover:bg-blue-200 transition-colors duration-200
                        disabled:bg-gray-300 disabled:text-gray-500 cursor-not-allowed`}
                            onClick={() => handleLanguageSelection(lang)}
                            disabled={selectedLanguage !== lang} // ✅ Disable other buttons
                        >
                            {lang.toUpperCase()}
                        </button>
                    ))}
                </div> */}
            </div>

            <div className="overflow-x-auto">
                <Table striped bordered hover responsive className='pb-0'>
                    <thead>
                        <tr>
                            <th></th>
                            <th
                                onClick={() => handleSort('name')}
                                style={{ cursor: 'pointer' }}
                            >
                                Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                            </th>
                            {/* <th
                                        >
                                            Polygon
                                        </th> */}
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
                        ) : districts.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">No district found</td>
                            </tr>
                        ) : (
                            districts.map((district, index) => (
                                <tr key={district.id}>
                                    <td className='text-center'>
                                        <input
                                            type="checkbox"
                                            className='h-5 w-5 mt-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                                        // checked={selectedState.includes(state.id)}
                                        // onChange={() => handleCheckboxChange(state.id)}
                                        />
                                    </td>
                                    <td>{district.name}</td>
                                    {/* <td></td> */}
                                    <td>{district.totaluser}</td>
                                    <td>{district.typeCount}</td>
                                    <td>
                                        <div className='flex flex-col'>
                                            <span>Lat : {district.location !== 'N/A' ? district.location.split(',')[0].trim() : 'N/A'}</span>
                                            <span>Lng : {district.location !== 'N/A' ? district.location.split(',')[1].trim() : 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{district.languages}</td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDelete(district.id)}
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

            <DistrictAddModal
                show={showModal}
                handleClose={() => setShowModal(false)}
                refreshData={fetchDistrict}
            />

        </div>
    )
}

export default District;
