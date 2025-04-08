import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API_BASE_URL from '../config'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EditCityModal({ show, handleClose, cityId, onUpdate, selectedLanguage }) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
    });
    const [modalLanguage, setModalLanguage] = useState(selectedLanguage || 'en'); // Default English
    const [city, setCity] = useState(''); // To preview
    const navigate = useNavigate()

    const fetchCitybyId = async () => {
        try {
            const token = localStorage.getItem('token'); // or your token key

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_BASE_URL}/api/talukabyid/${cityId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Add authorization header
                    'Accept-Language': selectedLanguage,
                }
            });
            setCity(response.data.data);
        } catch (err) {
            if (err.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login'); // Redirect to login page
            }
        }
    }
    // Update form data when category changes
    useEffect(() => {
        fetchCitybyId();
    }, [selectedLanguage]);

    useEffect(() => {
        if (city) {
            setFormData({
                name: city.languages?.[modalLanguage]?.name || city.name || '',
                code: city.languages?.[modalLanguage]?.code || city.code || '',
            });
        }
    }, [city, modalLanguage]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const updatedData = {
            name: formData.name,
            code: formData.code,
            language: modalLanguage
        };

        await onUpdate(city.id, updatedData);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit City</Modal.Title>
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
                    {/* <Form.Group className="mb-3">
                        <Form.Label>Code</Form.Label>
                        <Form.Control
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            readOnly
                        />
                    </Form.Group> */}
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
    )
}

export default EditCityModal
