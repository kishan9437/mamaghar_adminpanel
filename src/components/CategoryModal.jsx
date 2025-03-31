import axios from 'axios';
import React, { useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const CategoryModal = ({ show, handleClose, refreshData }) => {
    const [category, setCategory] = useState({
        en: { name: "", type: "", titleHint: "", detailsHint: "" },
        gu: { name: "", type: "", titleHint: "", detailsHint: "" },
        hi: { name: "", type: "", titleHint: "", detailsHint: "" }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState("en");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory({
            ...category,
            [selectedLanguage]: {
                ...category[selectedLanguage],
                [name]: value
            }
        });
    };

    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
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

            const requestData = {
                name: category.en.name || "", // Ensure English name
                type: category.en.type || "",
                titleHint: category.en.titleHint || "",
                detailsHint: category.en.detailsHint || "",
                languages: {
                    en: {
                        name: category.en.name || "",  // Default English
                        type: category.en.type || "",
                        titleHint: category.en.titleHint || "",
                        detailsHint: category.en.detailsHint || ""
                    },
                    gu: {
                        name: category.gu.name || "",
                        type: category.gu.type || "",
                        titleHint: category.gu.titleHint || "",
                        detailsHint: category.gu.detailsHint || ""
                    },
                    hi: {
                        name: category.hi.name || "",
                        type: category.hi.type || "",
                        titleHint: category.hi.titleHint || "",
                        detailsHint: category.hi.detailsHint || ""
                    }
                }
            };
            
            const response = await axios.post(
                `${API_BASE_URL}/post-category`,
                // { languages: category },
                requestData,
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
                    en: { name: "", type: "", titleHint: "", detailsHint: "" },
                    gu: { name: "", type: "", titleHint: "", detailsHint: "" },
                    hi: { name: "", type: "", titleHint: "", detailsHint: "" }
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
                        <Form.Control
                            type="text"
                            name="name"
                            value={category[selectedLanguage].name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Category Type</Form.Label>
                        <Form.Control
                            type="text"
                            name="type"
                            value={category[selectedLanguage].type}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Title Hint</Form.Label>
                        <Form.Control
                            type="text"
                            name="titleHint"
                            value={category[selectedLanguage].titleHint}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Details Hint</Form.Label>
                        <Form.Control
                            type="text"
                            name="detailsHint"
                            value={category[selectedLanguage].detailsHint}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Select Language</Form.Label>
                        <Form.Select as="select" value={selectedLanguage} onChange={handleLanguageChange}>
                            <option value="en">English</option>
                            <option value="gu">ગુજરાતી</option>
                            <option value="hi">हिंदी</option>
                        </Form.Select>
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
