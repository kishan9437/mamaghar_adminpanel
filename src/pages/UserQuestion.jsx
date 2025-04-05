import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Spinner, Alert } from 'react-bootstrap';
import API_BASE_URL from '../config';

const UserQuestion = () => {
    const { userId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserQuestions = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/questionbyuser/${userId}`);
                setQuestions(response.data.data || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUserQuestions();
    }, [userId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-5 my-10">
                {error}
            </Alert>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-5 py-8">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-8"> Questions</h3>

            {questions.length === 0 ? (
                <div className="text-center py-16">
                    <p className='text-lg text-gray-600'>No questions found for this user.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
                    {questions.map((question) => (
                        <div key={question._id} className="bg-white rounded-xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 shadow-md">
                            <div className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
                                <img
                                    src={`${API_BASE_URL}${question.userId.profilePicUrl}`}
                                    alt={question.userId.name}
                                    className="w-12 h-12 rounded-full object-cover mr-3"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/mamaGhar.png';
                                    }}
                                />
                                <div className="font-medium text-gray-900 m-0">
                                    <h4 className='mb-0'>{question.userId.name}</h4>
                                    <span className="text-xs text-gray-500">
                                        {new Date(question.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="text-xl font-semibold text-blue-600 mt-0 mb-2">{question.question}</h3>
                                <p className="text-gray-700 leading-relaxed mb-4">{question.details}</p>
                                {question.photoUrls?.length > 0 && (
                                    <div className="space-y-3 mt-3">
                                        {question.photoUrls.map((url, index) => (
                                            <img
                                                key={index}
                                                src={`${API_BASE_URL}${url}`}
                                                alt={`Question ${index + 1}`}
                                                className="w-full rounded-lg max-h-80 object-contain"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/mamaGhar.png';
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="px-4 py-2 border-t border-gray-200">
                                <span className="font-bold text-red-500">
                                    {question.likedBy?.length || 0} likes
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserQuestion;