import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import API_BASE_URL from "../config";

const SubCategoryModal = ({ show, handleClose,refreshData }) => {
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (show) {
            const getCategories = async () => {
                try {
                    // const data = await fetchCategories();
                    const response = await axios.get(`${API_BASE_URL}/getCategoryById`);
                    setCategories(response.data.data);
                } catch (error) {
                    console.error("Error fetching categories:", error);
                }
            };
            getCategories();
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found.");
                navigate("/login"); // Redirect to login page
                return;
            }

            const response = await axios.post(
                `${API_BASE_URL}/post-subcategory`,
                { name, categoryId, description },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to headers
                        "Content-Type": "application/json",
                    },
                }
            );
            setMessage(response.data.message || "Subcategory added successfully!");

            setTimeout(() => {
                handleClose(); // Close modal
                setMessage(null); // Reset message after closing modal

                // Clear input fields
                setName("");
                setCategoryId("");
                setDescription("");

                refreshData();
            }, 2000);
        } catch (err) {
            console.error("API Error:", err);

            if (err.response) {
                setError(err.response.data?.message || "Something went wrong");

                if (err.response.status === 401) {
                    alert("Session expired. Please log in again.");
                    localStorage.removeItem("token");
                    navigate("/login"); // Redirect to login page
                }
            } else {
                setError("Network error or server is down");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Add Subcategory</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Category:</Form.Label>
                        <Form.Select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Subcategory Name:</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description:</Form.Label>
                        <Form.Control
                            as="textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Form.Group>

                    <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? <Spinner size="sm" animation="border" /> : "Save"}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default SubCategoryModal;