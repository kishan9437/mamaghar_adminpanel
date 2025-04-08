import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API_BASE_URL from '../config';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditCategoryModal = ({ show, handleClose, categoryId, onUpdate, selectedLanguage }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        titleHint: '',
        detailsHint: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState([]); // To preview old/new image
    const [category, setCategory] = useState(''); // To preview
    const navigate = useNavigate()

    const fetchCategoriesbyLanguage = async () => {
        try {
            const token = localStorage.getItem('token'); // or your token key

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_BASE_URL}/api/getcategoriesbylang/${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Add authorization header
                    'Accept-Language': selectedLanguage,
                }
            });
            setCategory(response.data.data);
        } catch (err) {
            if (err.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login'); // Redirect to login page
            }
        }
    }
    // Update form data when category changes
    useEffect(() => {
        fetchCategoriesbyLanguage();
    }, [selectedLanguage]);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.languages?.[selectedLanguage]?.name || category.name || '',
                type: category.languages?.[selectedLanguage]?.type || category.type || '',
                titleHint: category.languages?.[selectedLanguage]?.titleHint || category.titleHint || '',
                detailsHint: category.languages?.[selectedLanguage]?.detailsHint || category.detailsHint || '',
                image: category.image // Preserve existing image path
            });
            setPreviewImage(category.image ? `${API_BASE_URL}${category.image}` : '');
        }
    }, [category, selectedLanguage]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setPreviewImage(URL.createObjectURL(file)); // Preview new image
        }
    };

    const handleSubmit = async () => {
        const updatedData = new FormData();
        updatedData.append('name', formData.name);
        updatedData.append('type', formData.type);
        updatedData.append('titleHint', formData.titleHint);
        updatedData.append('detailsHint', formData.detailsHint);
        updatedData.append('language', selectedLanguage);

        // Only append image if a new one was selected
        if (formData.image && typeof formData.image !== 'string') {
            updatedData.append('image', formData.image);
        }

        try {
            await onUpdate(category.id, updatedData);
            handleClose();
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    {/* Repeat for other fields (type, titleHint, detailsHint) */}
                    {/* <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Control
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        />
                    </Form.Group> */}
                    <Form.Group className="mb-3">
                        <Form.Label>titleHint</Form.Label>
                        <Form.Control
                            name="titleHint"
                            value={formData.titleHint}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>detailsHint</Form.Label>
                        <Form.Control
                            name="detailsHint"
                            value={formData.detailsHint}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Image</Form.Label>
                        {previewImage && <img src={previewImage} alt="Category" width="100" height="100" className="mb-2" />}
                        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditCategoryModal;