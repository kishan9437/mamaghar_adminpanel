import axios from 'axios';
import React, { useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const CategoryModal = ({ show, handleClose,refreshData }) => {
    const [category, setCategory] = useState({
        name: "",
        type: "",
        titleHint: "",
        detailsHint: "",
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCategory({ ...category, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("No authentication token found.");
                navigate('/login'); // Redirect to login page
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/post-category`,
                category,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to headers
                        "Content-Type": "application/json",
                    },
                }
            );
            setMessage(response.data.message);

            setTimeout(() => {
                handleClose(); // Close modal
                setMessage(null); // Reset message after closing modal

                // Clear input fields
                setCategory({
                    name: "",
                    type: "",
                    titleHint: "",
                    detailsHint: ""
                });

                refreshData()
            }, 2000);
        } catch (err) {
            console.error("API Error:", err);

            if (err.response) {
                setError(err.response.data?.message || "Something went wrong");

                if (err.response.status === 401) {
                    alert('Session expired. Please log in again.');
                    navigate('/login'); // Redirect to login page
                }
            } else {
                setError("Network error or server is down");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} className='mt-5'>
            <Modal.Header closeButton>
                <Modal.Title>Add New Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Category Name</Form.Label>
                        <Form.Control type="text" name="name" value={category.name} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Category Type</Form.Label>
                        <Form.Control type="text" name="type" value={category.type} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Title Hint</Form.Label>
                        <Form.Control type="text" name="titleHint" value={category.titleHint} onChange={handleChange} required />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Details Hint</Form.Label>
                        <Form.Control type="text" name="detailsHint" value={category.detailsHint} onChange={handleChange} required />
                    </Form.Group>

                    <div className="flex justify-end">
                        <Button variant="secondary" className="mr-2" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    )
}

export default CategoryModal;
