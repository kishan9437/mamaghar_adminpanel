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
    const [image, setImage] = useState(null);
    const [selectedImage, setSelectedImage] = useState();
    const [typeLocked, setTypeLocked] = useState(false);
    const [typeEditLanguage, setTypeEditLanguage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "type") {
            if (!typeLocked) {
                // First time setting type - lock it and remember the language
                setTypeLocked(true);
                setTypeEditLanguage(selectedLanguage);

                // Update type in all languages
                setCategory(prev => ({
                    en: { ...prev.en, type: value },
                    gu: { ...prev.gu, type: value },
                    hi: { ...prev.hi, type: value }
                }));
            } else if (selectedLanguage === typeEditLanguage) {
                // Only allow changes in the original language
                setCategory(prev => ({
                    en: { ...prev.en, type: value },
                    gu: { ...prev.gu, type: value },
                    hi: { ...prev.hi, type: value }
                }));
            }
        } else {
            // Normal field update
            setCategory(prev => ({
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

            if (!category.en.name || !category.gu.name || !category.hi.name) {
                setError("All language categories are required.");
                setLoading(false);
                return;
            }
            // Generate Slug from English Name
            const slug = slugify(category.en.name);

            // Prepare FormData
            const formData = new FormData();
            formData.append('name', category.en.name);
            formData.append('type', category.en.type);
            formData.append('titleHint', category.en.titleHint);
            formData.append('detailsHint', category.en.detailsHint);
            formData.append('slug', slug); // Attach generated slug
            // formData.append('image', image); // Attach Image

            // Append Image File
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            // Prepare languages data with consistent image and slug
            const languagesData = {
                en: {
                    name: category.en.name,
                    type: category.en.type,
                    titleHint: category.en.titleHint,
                    detailsHint: category.en.detailsHint,
                    slug: slug, // Include slug in each language
                    // image will be added by backend to all languages
                },
                gu: {
                    name: category.gu.name || category.en.name,
                    type: category.gu.type || category.en.type,
                    titleHint: category.gu.titleHint || category.en.titleHint,
                    detailsHint: category.gu.detailsHint || category.en.detailsHint,
                    slug: slug, // Same slug for Gujarati
                    // image will be added by backend to all languages
                },
                hi: {
                    name: category.hi.name || category.en.name,
                    type: category.hi.type || category.en.type,
                    titleHint: category.hi.titleHint || category.en.titleHint,
                    detailsHint: category.hi.detailsHint || category.en.detailsHint,
                    slug: slug,
                }
            };

            // Add languages as JSON string
            formData.append('languages', JSON.stringify(languagesData));

            const response = await axios.post(
                `${API_BASE_URL}/api/post-category`,
                // { languages: category },
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Add token to headers
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setMessage(response.data.message);

            setTimeout(() => {
                handleClose(); // Close modal
                setMessage(null); // Reset message after closing modal

                setTypeLocked(false);
                setTypeEditLanguage(null);
                // Clear input fields
                setCategory({
                    en: { name: "", type: "", titleHint: "", detailsHint: "" },
                    gu: { name: "", type: "", titleHint: "", detailsHint: "" },
                    hi: { name: "", type: "", titleHint: "", detailsHint: "" }
                });
                setImage(null);
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
                <Modal.Title>Add New Category</Modal.Title>
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
                                onClick={() => setSelectedLanguage(lang)}
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
                            value={category[selectedLanguage].name}
                            onChange={handleChange}
                            placeholder={`Enter name ${selectedLanguage.toUpperCase()} language`}
                            required
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Select
                            name="type"
                            value={category[selectedLanguage].type}
                            onChange={handleChange}
                            required
                            disabled={typeLocked && selectedLanguage !== typeEditLanguage}
                            className={typeLocked && selectedLanguage !== typeEditLanguage ? 'bg-light' : ''}
                        >
                            <option value="">Select Type</option>
                            <option value="Post">Post</option>
                            <option value="Question">Question</option>
                        </Form.Select>

                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Title Hint</Form.Label>
                        <Form.Control
                            type="text"
                            name="titleHint"
                            value={category[selectedLanguage].titleHint}
                            placeholder={`Enter titleHint ${selectedLanguage.toUpperCase()} language`}
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
                            placeholder={`Enter detailsHint ${selectedLanguage.toUpperCase()} language`}
                            required
                        />
                    </Form.Group>

                    {/* Image Upload */}
                    <Form.Group className="mb-3">
                        <Form.Label>Upload Image</Form.Label>
                        <Form.Control type="file" onChange={(e) => setSelectedImage(e.target.files[0])} />
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
