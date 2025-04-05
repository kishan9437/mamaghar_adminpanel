import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const DistrictAddModal = ({ show, handleClose, refreshData }) => {
    const [districtData, setDistrictData] = useState({
        en: { name: "", code: "", stateId: "" },
        gu: { name: "", code: "", stateId: "" },
        hi: { name: "", code: "", stateId: "" }
    });
    const [states, setStates] = useState([]); // All states from API
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState("en");

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${API_BASE_URL}/api/statebylanguage`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log(res);
                setStates(res.data.data || []);
            } catch (err) {
                console.error("Failed to fetch states:", err);
            }
        };
        fetchStates();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDistrictData(prev => ({
            ...prev,
            [selectedLanguage]: {
                ...prev[selectedLanguage],
                [name]: value
            }
        }));
    };

    const slugify = (text) => {
        return text.toString().toLowerCase().trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-');
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
            const slug = slugify(districtData.en.name);

            // Prepare languages data with consistent image and slug
            let filteredLanguages = {};
            Object.keys(districtData).forEach(lang => {
                if (districtData[lang].name.trim() && districtData[lang].stateId) {
                    filteredLanguages[lang] = {
                        name: districtData[lang].name,
                        code: districtData[lang].code,
                        slug,
                    };
                }
            });

            if (!districtData.en.name || !districtData.en.code || !districtData.en.stateId) {
                setError("English name, code, and state are required.");
                setLoading(false);
                return;
            }

            // ✅ Prepare request data
            const formData = {
                name: districtData.en.name,
                code: districtData.en.code,
                slug,
                stateId: districtData.en.stateId,
                languages: filteredLanguages
            };

            const response = await axios.post(
                `${API_BASE_URL}/api/district`,
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
                setDistrictData({
                    en: { name: "", code: "", stateId: "" },
                    gu: { name: "", code: "", stateId: "" },
                    hi: { name: "", code: "", stateId: "" }
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
        return states.map((state) => ({
            _id: state._id,
            name: (typeof state.name === 'object' ? state.name.name : state.name) || "Unnamed"
        }));
    };

    return (
        <Modal show={show} onHide={handleClose} >
            <Modal.Header closeButton>
                <Modal.Title>Add New District</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {message && <Alert variant="success">{message}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit} >
                    <Form.Group className="mb-3">
                        <Form.Label>State</Form.Label>
                        <Form.Select
                            name="stateId"
                            value={districtData[selectedLanguage].stateId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Select State --</option>
                            {getStatesForLanguage().map((state) => (
                                <option key={state._id} value={state._id}>
                                    {state.name} {/* ✅ FIXED */}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={districtData[selectedLanguage]?.name || ""}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>code</Form.Label>
                        <Form.Control
                            type="text"
                            name="code"
                            value={districtData[selectedLanguage].code || ""}
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

export default DistrictAddModal;
