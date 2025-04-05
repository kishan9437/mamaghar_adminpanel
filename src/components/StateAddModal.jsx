import axios from 'axios';
import React, { useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const StateAddModal = ({ show, handleClose, refreshData }) => {
    const [stateData, setStateData] = useState({
        en: { name: "", code: "" },
        gu: { name: "", code: "" },
        hi: { name: "", code: "" }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState("en");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStateData(prev => ({
            ...prev,
            [selectedLanguage]: {
                ...prev[selectedLanguage],
                [name]: value
            }
        }));
    };

    const slugify = (text) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^\w-]+/g, '') // Remove all non-word chars
            .replace(/--+/g, '-'); // Replace multiple - with single -
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

            // Generate Slug from English Name
            const slug = slugify(stateData.en.name);

            // Prepare languages data with consistent image and slug
            let filteredLanguages = {};
            Object.keys(stateData).forEach(lang => {
                if (stateData[lang].name.trim()) {  // Only include languages where name is filled
                    filteredLanguages[lang] = {
                        name: stateData[lang].name,
                        code: stateData[lang].code,
                        slug: slug,
                    };
                }
            });

            if (Object.keys(filteredLanguages).length === 0) {
                setError("At least one language must be filled.");
                setLoading(false);
                return;
            }

            // ✅ Prepare request data
            const formData = {
                name: stateData.en.name,  // Still required at the root level
                code: stateData.en.code,
                slug: slug,
                languages: filteredLanguages
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/state`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setMessage(response.data.message);

            setTimeout(() => {
                handleClose(); // Close modal
                setMessage(null); // Reset message after closing modal

                setStateData({ en: { name: "", code: "" }, gu: { name: "", code: "" }, hi: { name: "", code: "" } });
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
        <Modal show={show} onHide={handleClose} >
            <Modal.Header closeButton>
                <Modal.Title>Add New State</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit} encType="multipart/form-data">
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={stateData[selectedLanguage].name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>code</Form.Label>
                        <Form.Control
                            type="text"
                            name="code"
                            value={stateData[selectedLanguage].code}
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

export default StateAddModal;
