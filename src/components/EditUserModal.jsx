import axios from 'axios';
import React, { useEffect, useState } from 'react'
import API_BASE_URL from '../config';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Modal } from 'react-bootstrap';

function EditUserModal({ show, handleClose, userData, refreshUsers }) {
    const [formData, setFormData] = useState({
        name: "",
        state: "",
        city: "",
        district: "",
        address: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (userData) {
            setFormData({
                name: userData.name || "",
                state: userData.state || "",
                city: userData.city || "",
                district: userData.district || "",
                address: userData.address || "",
            });
        }
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateUser = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Unauthorized. Please log in.");
                return;
            }

            const response = await axios.put(
                `${API_BASE_URL}/users/${userData._id}`,
                formData,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert("User updated successfully!");
            handleClose();
            refreshUsers(); // Refresh user list after update
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch categories');
            if (error.response?.status === 401) {
                alert('Session expired. Please log in again.');
                navigate('/login'); // Redirect to login page
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <p className="text-danger">{error}</p>}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>District</Form.Label>
                        <Form.Control
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button
                    variant="primary"
                    onClick={handleUpdateUser}
                    disabled={loading}
                >
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default EditUserModal;
