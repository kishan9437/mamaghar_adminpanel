import React, { useState, useEffect } from 'react';
import { Header } from '../components';
import { Button, Table, Form, Pagination, InputGroup } from 'react-bootstrap';
import SubCategoryModal from '../components/SubCategoryModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import EditSubCategoryModal from '../components/EditSubCategoryModal';

const SubCategories = () => {
  const [showModal, setShowModal] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'name',
    direction: 'desc',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Fetch sub-categories from API
  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const { page, limit } = pagination;

      const response = await axios.get(`${API_BASE_URL}/post-subcategory`, {
        params: {
          page,
          limit,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
          search: searchTerm,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': selectedLanguage,
        },
      });

      setSubCategories(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sub-categories');
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, page: 1 }); // Reset to page 1 on new search
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination({ ...pagination, page });
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/delete-subcategory/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh the list
      fetchSubCategories();
      alert('Category deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login'); // Redirect to login page
      }
    }
  };

  const handleUpdateSubCategory = async (subCategoryId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/update-subcategory/${subCategoryId}`,
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // 🔥 Update Table Immediately Without Refresh
        setSubCategories((prevSubCategories) =>
          prevSubCategories.map((sub) =>
            sub.id === subCategoryId ? { ...sub, ...updatedData } : sub
          )
        );
        alert('Subcategory updated successfully');
        return { success: true };
      }

      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch subcategories');
      if (error.response?.status === 401) {
        alert('Session expired. Please log in again.');
        navigate('/login'); // Redirect to login page
      }
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchSubCategories();
  }, [pagination.page, pagination.limit, sortConfig, searchTerm, selectedLanguage]);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <div className="m-1 mt-3 p-1">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">SubCategories</h3>
        <Button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleShowModal}>
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
        <InputGroup style={{ width: '300px' }}>
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            placeholder="Search sub-categories..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </InputGroup>
      </div>

      {/* Sub-Categories Table */}
      <div className="overflow-x-auto">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>No</th>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                Name {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
              </th>
              <th onClick={() => handleSort('categoryId.name')} style={{ cursor: 'pointer' }}>
                Category {sortConfig.key === 'categoryId.name' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
              </th>
              <th onClick={() => handleSort('description')} style={{ cursor: 'pointer' }}>
                Description {sortConfig.key === 'description' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
              </th>
              {/* <th onClick={() => handleSort('createdAt')} style={{ cursor: 'pointer' }}>
                Created At {sortConfig.key === 'createdAt' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
              </th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="text-center text-danger py-4">{error}</td>
              </tr>
            ) : subCategories.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4">No categories found</td>
              </tr>
            ) : (
              subCategories.map((subCat, index) => (
                <tr key={subCat._id}>
                  <td>{(index + 1) + (pagination.page - 1) * (pagination.limit)}</td>
                  <td>{subCat.name}</td>
                  <td>{subCat.categoryName}</td>
                  <td>{subCat.description}</td>
                  {/* <td>{new Date(subCat.createdAt).toLocaleString()}</td> */}
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => {
                        setEditingSubCategory(subCat);
                        setShowEditModal(true);
                      }}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(subCat.id)}
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
        <Pagination>
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={pagination.page === 1}
          />
          <Pagination.Prev
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          />
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === pagination.page}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          />
          <Pagination.Last
            onClick={() => handlePageChange(pagination.totalPages)}
            disabled={pagination.page >= pagination.totalPages}
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

      {/* Modal for Add/Edit */}
      <SubCategoryModal show={showModal} handleClose={handleCloseModal} refreshData={fetchSubCategories} />

      {editingSubCategory && (
        <EditSubCategoryModal
          show={showEditModal}
          handleClose={() => {
            setShowEditModal(false);
            setEditingSubCategory(null);
          }}
          subCategory={editingSubCategory}
          onUpdate={handleUpdateSubCategory}
          // categories={subCategories}
          selectedLanguage={selectedLanguage}
        />)}
    </div>
  );
};

export default SubCategories;