import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API_BASE_URL from '../config'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function EditDistrictModal({ show, handleClose, districtId, onUpdate, selectedLanguage }) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
    });
    const [modalLanguage, setModalLanguage] = useState(selectedLanguage || 'en'); // Default English
    const [district, setDistrict] = useState(''); // To preview
    const navigate = useNavigate()

    const fetchStatebyId = async () => {
        try {
            const token = localStorage.getItem('token'); // or your token key

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(`${API_BASE_URL}/api/districtbyid/${districtId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Add authorization header
                    'Accept-Language': selectedLanguage,
                }
            });
            setDistrict(response.data.data);
        } catch (err) {
            if (err.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login'); // Redirect to login page
            }
        }
    }
    // Update form data when category changes
    useEffect(() => {
        fetchStatebyId();
    }, [selectedLanguage]);

    useEffect(() => {
        if (district) {
            setFormData({
                name: district.languages?.[modalLanguage]?.name || district.name || '',
                code: district.languages?.[modalLanguage]?.code || district.code || '',
            });
        }
    }, [district, modalLanguage]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const updatedData = {
            name: formData.name,
            code: formData.code,
            language: modalLanguage
        };

        await onUpdate(district.id, updatedData);
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit District</Modal.Title>
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

export default EditDistrictModal
