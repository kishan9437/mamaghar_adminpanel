import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const EditSubCategoryModal = ({ show, handleClose, subCategory, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        description: ''
    });

    // Update form data when category changes
    useEffect(() => {
        if (subCategory) {
            setFormData({
                name: subCategory.name,
                categoryId: subCategory.categoryId?._id || '',
                description: subCategory.description || ''
            });
        }
    }, [subCategory]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            await onUpdate(subCategory._id, formData);
            handleClose();
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit SubCategory</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>
                    {/* Repeat for other fields (type, titleHint, detailsHint) */}
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
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

export default EditSubCategoryModal;