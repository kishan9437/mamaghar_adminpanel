import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditCategoryModal = ({ show, handleClose, category, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: '',
        titleHint: '',
        detailsHint: ''
    });

    // Update form data when category changes
    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                type: category.type,
                titleHint: category.titleHint,
                detailsHint: category.detailsHint
            });
        }
    }, [category]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await onUpdate(category._id, formData);
            handleClose();
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    {/* Repeat for other fields (type, titleHint, detailsHint) */}
                    <Form.Group className="mb-3">
                        <Form.Label>Type</Form.Label>
                        <Form.Control
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>titleHint</Form.Label>
                        <Form.Control
                            name="titleHint"
                            value={formData.titleHint}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>detailsHint</Form.Label>
                        <Form.Control
                            name="detailsHint"
                            value={formData.detailsHint}
                            onChange={handleChange}
                        />
                    </Form.Group>

                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditCategoryModal;