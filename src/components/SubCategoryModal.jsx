import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import API_BASE_URL from "../config";

const SubCategoryModal = ({ show, handleClose, refreshData }) => {
    const [subcategory, setSubcategory] = useState({
        en: { name: "", description: "" },
        gu: { name: "", description: "" },
        hi: { name: "", description: "" }
    });
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("en");
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSubcategory({
            ...subcategory,
            [selectedLanguage]: {
                ...subcategory[selectedLanguage],
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
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found.");
                navigate("/login"); // Redirect to login page
                return;
            }

            const requestData = {
                name: subcategory.en.name || "", // Ensure English name
                description: subcategory.en.description || "",
                categoryId, // Ensure categoryId is included
                languages: {
                    en: {
                        name: subcategory.en.name || "",
                        description: subcategory.en.description || "",
                    },
                    gu: {
                        name: subcategory.gu.name || "",
                        description: subcategory.gu.description || "",
                    },
                    hi: {
                        name: subcategory.hi.name || "",
                        description: subcategory.hi.description || "",
                    }
                }
            };

            const response = await axios.post(
                `${API_BASE_URL}/post-subcategory`,
                // { name, categoryId, description },
                requestData,
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
                setSubcategory({
                    en: { name: "", description: "" },
                    gu: { name: "", description: "" },
                    hi: { name: "", description: "" }
                });
                setCategoryId("");

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
                                    {category.languages[selectedLanguage]?.name || category.languages.en.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Subcategory Name:</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={subcategory[selectedLanguage].name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Description:</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={subcategory[selectedLanguage].description}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Select Language</Form.Label>
                        <Form.Select value={selectedLanguage} onChange={handleLanguageChange}>
                            <option value="en">English</option>
                            <option value="gu">ગુજરાતી</option>
                            <option value="hi">हिंदी</option>
                        </Form.Select>
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