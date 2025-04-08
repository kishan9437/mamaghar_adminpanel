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
    const [codeEditedLanguage, setCodeEditedLanguage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "code") {
            // If code is being edited for the first time, remember the language
            if (!codeEditedLanguage) {
                setCodeEditedLanguage(selectedLanguage);
            }

            // Update code in all languages
            const updatedData = { ...stateData };
            ['en', 'gu', 'hi'].forEach(lang => {
                updatedData[lang] = {
                    ...updatedData[lang],
                    code: value
                };
            });
            setStateData(updatedData);
        } else {
            // Update name for current language only
            setStateData(prev => ({
                ...prev,
                [selectedLanguage]: {
                    ...prev[selectedLanguage],
                    [name]: value
                }
            }));
        }
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

    const handleLanguageChange = (lang) => {
        setSelectedLanguage(lang);
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
            const langData = stateData[selectedLanguage];

            if (!langData.name || !langData.code) {
                setError("Name and Code are required for the selected language.");
                setLoading(false);
                return;
            }

            const slug = slugify(langData.name);

            const formData = {
                name: langData.name,
                code: langData.code,
                slug,
                languages: {
                    [selectedLanguage]: {
                        name: langData.name,
                        code: langData.code,
                        slug
                    }
                }
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
                handleClose();
                setMessage(null);
                setCodeEditedLanguage(null)
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
                    {/* Language Tabs */}
                    <div className="flex border-b mb-4">
                        {['en', 'gu', 'hi'].map((lang) => (
                            <button
                                key={lang}
                                type="button"
                                className={`px-4 py-2 font-medium text-sm focus:outline-none ${selectedLanguage === lang
                                    ? 'border-b-2 border-blue-500 text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                onClick={() => handleLanguageChange(lang)}
                            >
                                {lang === 'en' && 'EN'}
                                {lang === 'gu' && 'GU'}
                                {lang === 'hi' && 'HI'}
                            </button>
                        ))}
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={stateData[selectedLanguage].name}
                            onChange={handleChange}
                            placeholder={`Enter name ${selectedLanguage.toUpperCase()} language`}
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
                            placeholder={`Enter code ${selectedLanguage.toUpperCase()} language`}
                            required
                            readOnly={codeEditedLanguage !== null && selectedLanguage !== codeEditedLanguage}
                            className={codeEditedLanguage !== null && selectedLanguage !== codeEditedLanguage ? 'bg-light' : ''}
                        />
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
