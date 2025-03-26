import { useDispatch } from 'react-redux';
import { loginAdmin } from '../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Form, Alert } from 'react-bootstrap';

const SignIn = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({ email: '', password: '' });
    const [serverError, setServerError] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        const newErrors = { email: '', password: '' };

        if (!formData.email) {
            newErrors.email = "Email is Required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid Email Format.";
        }

        if (!formData.password) {
            newErrors.password = "Password is required.";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long.";
        }

        setErrors(newErrors);
        return Object.values(newErrors).every((val) => val === '');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setServerError(null);
        const result = await dispatch(loginAdmin(formData));
        if (result.meta.requestStatus === 'fulfilled') {
            navigate('/dashboard'); // Redirect to Dashboard after successful login
        }
        else {
            setServerError("Invalid credentials. Please try again.");
        }
    };
    return (
        <div className='container d-flex justify-content-center align-item-center ' style={{marginTop:'150px'}}>
            <div className='card p-4 shadow-lg ' style={{ width: '26em' }}>
                <h4 className='text-center mb-4'>Login</h4>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="d-flex flex-wrap mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            className="rounded-input"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.email}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="d-flex flex-wrap mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            onChange={handleChange}
                            isInvalid={!!errors.password}
                            className="rounded-input"
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.password}
                        </Form.Control.Feedback>
                    </Form.Group>

                    <button type="submit" className="btn btn-primary w-100">Login</button>
                    {/* Server Error Message */}
                    {serverError && (
                        <Alert variant="danger" className="mt-3 text-center">
                            {serverError}
                        </Alert>
                    )}
                </Form>
            </div>

        </div>
    )
}

export default SignIn;