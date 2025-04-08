import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const CityAddModal = ({ show, handleClose, refreshData }) => {
    const [cityData, setCityData] = useState({
        en: { name: "", code: "", districtId: "" },
        gu: { name: "", code: "", districtId: "" },
        hi: { name: "", code: "", districtId: "" }
    });
    const [districts, setDistrict] = useState([]); // All states from API
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [codeEditedLanguage, setCodeEditedLanguage] = useState(null);

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_BASE_URL}/api/districtbylanguage`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Add authorization header
                        'Accept-Language': selectedLanguage,
                    }
                });
                setDistrict(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch district:", err);
            }
        };
        fetchStates();
    }, [selectedLanguage]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "code") {
            // If code is being edited for the first time, remember the language
            if (!codeEditedLanguage) {
                setCodeEditedLanguage(selectedLanguage);
            }

            // Update code in all languages
            const updatedData = { ...cityData };
            ['en', 'gu', 'hi'].forEach(lang => {
                updatedData[lang] = {
                    ...updatedData[lang],
                    code: value
                };
            });
            setCityData(updatedData);
        } else {
            // Update name for current language only
            setCityData(prev => ({
                ...prev,
                [selectedLanguage]: {
                    ...prev[selectedLanguage],
                    [name]: value
                }
            }));
        }
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

            const langData = cityData[selectedLanguage];

            // Validate required fields
            if (!langData.name || !langData.code || !langData.districtId) {
                setError("Name, Code and district are required for the selected language.");
                setLoading(false);
                return;
            }

            // Prepare languages data with consistent image and slug
            const randomNum = Math.floor(10 + Math.random() * 90);
            const generatedSlug = `${langData.name.replace(/\s+/g, '-')}-${randomNum}`;

            const formData = {
                name: langData.name,
                code: langData.code,
                districtId: langData.districtId,
                languages: {
                    [selectedLanguage]: {
                        name: langData.name,
                        code: langData.code,
                        slug: generatedSlug,
                        districtId: langData.districtId
                    }
                }
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/taluka`,
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
                setCityData({
                    en: { name: "", code: "", districtId: "" },
                    gu: { name: "", code: "", districtId: "" },
                    hi: { name: "", code: "", districtId: "" }
                });
                refreshData();
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

    const getStatesForLanguage = () => {
        return districts.map((state) => ({
            _id: state._id,
            name: (typeof state.name === 'object' ? state.name.name : state.name) || "Unnamed"
        }));
    };

    return (
        <Modal show={show} onHide={handleClose} >
            <Modal.Header closeButton>
                <Modal.Title>Add New City</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit} >
                    <Form.Group className="mb-3">
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

                        <Form.Label>District</Form.Label>
                        <Form.Select
                            name="districtId"
                            value={cityData[selectedLanguage].districtId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select District --</option>
                            {getStatesForLanguage().map((district) => (
                                <option key={district._id} value={district._id}>
                                    {district.name} {/* ✅ FIXED */}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={cityData[selectedLanguage]?.name || ""}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>code</Form.Label>
                        <Form.Control
                            type="text"
                            name="code"
                            value={cityData[selectedLanguage].code || ""}
                            onChange={handleChange}
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

export default CityAddModal;
