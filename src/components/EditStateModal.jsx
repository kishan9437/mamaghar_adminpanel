import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import API_BASE_URL from '../config'

function EditStateModal({ show, handleClose, state, onUpdate, selectedLanguage }) {
    const [formData, setFormData] = useState({
        name: '',
    });
    const [modalLanguage, setModalLanguage] = useState(selectedLanguage || 'en'); // Default English
    
    useEffect(() => {
        if (state) {
            setFormData({
                name: state.languages?.[modalLanguage]?.name || state.name || '',
            });
        }
    }, [state, modalLanguage]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const updatedData = {
            name: formData.name,
            language: modalLanguage
        };

        await onUpdate(state.id, updatedData);
        handleClose();
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
    )
}

export default EditStateModal
