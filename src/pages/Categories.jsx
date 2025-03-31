import React, { useEffect, useState } from 'react';
import { Header } from '../components';
import { Button, Pagination, Table, Form, InputGroup } from 'react-bootstrap'; // Fixed Form import
import CategoryModal from '../components/CategoryModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import EditCategoryModal from '../components/EditCategoryModal';

const Categories = () => {
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
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
  const [editingCategory, setEditingCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { page, limit } = pagination;

      const token = localStorage.getItem('token'); // or your token key

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/post-category`, {
        params: {
          page,
          limit,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
          search: searchTerm,
        },
        headers: {
          'Authorization': `Bearer ${token}`, // Add authorization header
          'Accept-Language': selectedLanguage,
        }
      });

      setCategories(response.data.data);
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

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/delete-category/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh the list
      fetchCategories();
      alert('Category deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login'); // Redirect to login page
      }
    }
  };

  const handleUpdate = async (categoryId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/update-category/${categoryId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCategories((prevSubCategories) =>
          prevSubCategories.map((sub) =>
            sub.id === categoryId ? { ...sub, ...updatedData } : sub
          )
        );
        alert('Category updated successfully');
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
    fetchCategories();
  }, [pagination.page, pagination.limit, sortConfig, searchTerm, selectedLanguage]);

  return (
    <div className="m-1 mt-3 p-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Categories</h3>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          New
        </Button>
      </div>

      <div className='flex gap-2 mb-1'>
        <Form.Select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} style={{ width: '150px' }}>
          <option value="en">English</option>
          <option value="gu">ગુજરાતી</option>
          <option value="hi">हिंदी</option>
        </Form.Select>

        {/* Search Bar */}
        <InputGroup className="mb-0" style={{ width: '300px' }}>
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </InputGroup>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table striped bordered hover responsive className='pb-0'>
          <thead>
            <tr>
              <th>No</th>
              <th
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer' }}
              >
                Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
              </th>
              <th
                onClick={() => handleSort('type')}
                style={{ cursor: 'pointer' }}
              >
                Type {sortConfig.key === 'type' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
              </th>
              <th
                onClick={() => handleSort('titleHint')}
                style={{ cursor: 'pointer' }}
              >
                Title Hint {sortConfig.key === 'titleHint' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
              </th>
              <th
                onClick={() => handleSort('detailsHint')}
                style={{ cursor: 'pointer' }}
              >
                Details Hint {sortConfig.key === 'detailsHint' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
              </th>
              {/* <th
                  onClick={() => handleSort('createdAt')}
                  style={{ cursor: 'pointer' }}
                >
                  Created At {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
                </th> */}
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
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">No categories found</td>
              </tr>
            ) : (
              categories.map((category, index) => (
                <tr key={category.id}>
                  <td>{(index + 1) + (pagination.page - 1) * pagination.limit}</td>
                  <td>{category.name}</td>
                  <td>{category.type}</td>
                  <td>{category.titleHint}</td>
                  <td>{category.detailsHint}</td>
                  {/* <td>{new Date(category.createdAt).toLocaleString()}</td> */}
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => {
                        setEditingCategory(category);
                        setShowEditModal(true);
                      }}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
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

      <CategoryModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        refreshData={fetchCategories}
      />

      {editingCategory && (
        <EditCategoryModal
          show={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
            setEditingCategory(null);
          }}
          category={editingCategory}
          onUpdate={handleUpdate}
          selectedLanguage={selectedLanguage}
        />
      )}
    </div>
  );
};

export default Categories;