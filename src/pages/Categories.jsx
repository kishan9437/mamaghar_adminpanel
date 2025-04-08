import React, { useEffect, useState } from 'react';
import { Header } from '../components';
import { Button, Pagination, Table, Form, InputGroup, Image } from 'react-bootstrap'; // Fixed Form import
import CategoryModal from '../components/CategoryModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import EditCategoryModal from '../components/EditCategoryModal';
import { FaArrowRightLong } from "react-icons/fa6";
import Swal from 'sweetalert2';
import { FaTrash } from 'react-icons/fa';

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
  const [selectedType, setSelectedType] = useState("Post"); // Default selected is "post"
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [modalLanguage, setModalLanguage] = useState('en'); // 🔥 Independent modal language

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { page, limit } = pagination;

      const token = localStorage.getItem('token'); // or your token key

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_BASE_URL}/api/post-category`, {
        params: {
          page,
          limit,
          sortBy: sortConfig.key,
          sortOrder: sortConfig.direction,
          search: searchTerm,
          type: selectedType,
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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You want to delete this category?',
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
      await axios.delete(`${API_BASE_URL}/api/delete-category/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh the list
      fetchCategories();
      Swal.fire({
        title: 'Deleted!',
        text: 'Category deleted successfully.',
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
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

  const handleLanguageSelection = (category, lang) => {
    setEditingCategory(category);
    setModalLanguage(lang);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setEditingCategory(null);
    setSelectedCategories([]); // Clear checkbox selection
  };

  const handleUpdate = async (categoryId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/api/update-category/${categoryId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setCategories((prevSubCategories) =>
          prevSubCategories.map((sub) =>
            sub.id === categoryId ? { ...sub, ...updatedData } : sub
          )
        );
        alert('Category updated successfully');
        setShowEditModal(false);
        await fetchCategories()
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
  }, [pagination.page, pagination.limit, sortConfig, searchTerm, selectedType, selectedLanguage]);

  return (
    <div className="m-1 mt-3 p-1">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-bold">Categories</h3>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
        >
          New
        </Button>
      </div>
      <div className='flex items-center gap-2 bg-gray-50 px-2 py-2 rounded-lg font-sans w-fit mb-2 shadow-sm'>
        <h5 className='m-0 text-gray-500 text-lg font-semibold flex'>Type :</h5>
        <button
          className={`px-3 py-1.5 rounded-full text-sm transition-all border ${selectedType === "Post" ? "bg-blue-500 text-white border-blue-500" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          onClick={() => {
            setSelectedType("Post");
            setPagination(prev => ({ ...prev, page: 1 }));
          }}
        >
          Post
        </button>
        <button
          className={`px-3 py-1.5 rounded-full text-sm transition-all border ${selectedType === "Question" ? "bg-blue-500 text-white border-blue-500" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          onClick={() => {
            setSelectedType("Question");
            setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
          }}
        >
          Question
        </button>
      </div>
      <div className='flex'>
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
      </div>

      {/* Table */}
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
              <th
                onClick={() => handleSort('titleHint')}
                style={{ cursor: 'pointer' }}
              >
                Title Hint {sortConfig.key === 'titleHint' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
              </th>
              <th
                onClick={() => handleSort('type')}
                style={{ cursor: 'pointer' }}
              >
                Type {sortConfig.key === 'type' ? (sortConfig.direction === 'asc' ? '⬆' : '⬇') : ''}
              </th>
              <th>{selectedType === "Post" ? "Posts" : "Questions"}</th>
              <th>Languages</th>
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
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">No categories found</td>
              </tr>
            ) : (
              categories.map((category, index) => (
                <tr key={category.id}>
                  <td>
                    <div className='flex items-center'>
                      <div className='flex flex-col'>
                        <Image
                          src={`${API_BASE_URL}${category.image}`}
                          alt={category.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/mamaGhar.png';
                          }}
                        />
                      </div>
                      <div className='ml-2'>
                        <span>{category.name}</span>
                        <div className="flex items-center">
                          <span className="text-gray-500 text-sm">
                            {category.detailsHint}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{category.titleHint}</td>
                  <td>{category.type}</td>
                  <td>{category.typeCount}</td>
                  <td>
                    <div className='flex w-full gap-1 mb-1'>
                      {['en', 'gu', 'hi'].map(lang => (
                        <button
                          key={lang}
                          className={`px-2 py-1.5 rounded-md text-sm font-medium 
              border border-blue-200 hover:bg-blue-200 transition-colors duration-200
              ${selectedLanguage === lang ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}`}
                          onClick={() => {
                            setEditingCategory(category.id);
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
                      onClick={() => handleDelete(category.id)}
                      disabled={category.role === 'admin'}
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

      <CategoryModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        refreshData={fetchCategories}
      />

      {editingCategory && (
        <EditCategoryModal
          show={showEditModal}
          handleClose={handleModalClose}
          categoryId={editingCategory}
          onUpdate={handleUpdate}
          selectedLanguage={modalLanguage}
        />
      )}
    </div>
  );
};

export default Categories;