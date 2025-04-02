import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { Modal, Button } from "react-bootstrap";
import API_BASE_URL from '../config';

function UserReportModal({ show, userId,onHide }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show && userId) {
            fetchUserReports(userId);
        }
    }, [show, userId]);

    const fetchUserReports = async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/userbypostreport/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReports(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-b border-gray-200">
                <Modal.Title className="text-xl font-bold text-gray-800">
                    User Reports
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
                {loading ? (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-red-500 text-center">{error}</div>
                ) : reports.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">
                        No reports found for this user
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {reports.map((report, index) => (
                            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            {report.reporterId?.profilePic && (
                                                <img
                                                    src={report.reporterId.profilePic || "./mamaGhar.png"}
                                                    alt="Reporter"
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-500">
                                                    {report.reporterId?.name || "Unknown"}
                                                </span>
                                                <span className="text-xs font-medium text-gray-500">
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {report.reason.map((reason, i) => (
                                            <span key={i} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                {reason}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer className="border-t border-gray-200">
                <Button variant="secondary" onClick={onHide} className="px-4 py-2 rounded-lg">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default UserReportModal
