import React, { useState, useEffect } from 'react';
import { instance } from "../../Service/AxiosHolder/AxiosHolder";
import { Trash2, ArrowLeft, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function AcceptJobDocumentDetails() {
    const token = localStorage.getItem('authToken');
    const storedUser = JSON.parse(localStorage.getItem("userData"));
    const currentUserId = storedUser?.id;
    
    const [acceptedApplicants, setAcceptedApplicants] = useState([]);
    const [filteredApplicants, setFilteredApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const showSuccessMessage = (message) => {
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: message || "Operation successful",
            showConfirmButton: false,
            timer: 2000,
        });
    };

    const showErrorMessage = (msg) => {
        Swal.fire({
            position: "top-end",
            icon: "error",
            title: msg || "Error. Try again later.",
            showConfirmButton: false,
            timer: 2000,
        });
    };

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        if (currentUserId && acceptedApplicants.length > 0) {
            const filtered = acceptedApplicants.filter(applicant => 
                applicant.userId === currentUserId
            );
            setFilteredApplicants(filtered);
        } else {
            setFilteredApplicants(acceptedApplicants);
        }
    }, [currentUserId, acceptedApplicants]);

    function getData() {
        setLoading(true);
        instance.get('/job/getAcceptJobDocument', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            setAcceptedApplicants(response.data);
            setLoading(false);
        })
        .catch(error => {
            setError("Failed to load accepted applicants");
            setLoading(false);
            console.log(error);
        });
    }

    function deleteJobDocument(id) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                instance.delete(`/job/deleteAcceptJobDocument/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then(() => {
                    showSuccessMessage('Accepted applicant deleted successfully');
                    setAcceptedApplicants(prev => prev.filter(applicant => applicant.id !== id));
                })
                .catch(error => {
                    console.log(error);
                    showErrorMessage("Failed to delete accepted applicant");
                });
            }
        });
    }

    const handleAcceptApplicant = (applicantId) => {
        Swal.fire({
            title: 'Confirm Acceptance',
            text: "Are you sure you want to accept this applicant?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, accept!'
        }).then((result) => {
            if (result.isConfirmed) {
                // Here you would typically make an API call to update the status
                // For now, we'll just show a success message
                showSuccessMessage('Applicant accepted successfully');
                
                // In a real implementation, you would update the applicant's status:
                // updateApplicantStatus(applicantId, 'ACCEPTED');
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleGoBack = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={handleGoBack}
                    className="flex items-center text-blue-500 hover:text-blue-700 transition-colors"
                >
                    <ArrowLeft className="mr-1" size={20} />
                    Back
                </button>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Accepted Applicants
                </h1>
                <div></div> {/* Empty div for spacing */}
            </div>
            
            {loading && <div className="text-center py-8">Loading accepted applicants...</div>}
            {error && <div className="text-center py-8 text-red-500">{error}</div>}

            {!loading && filteredApplicants.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No accepted applicants available at the moment.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="py-3 px-6 text-left font-semibold">Username</th>
                                <th className="py-3 px-6 text-left font-semibold">Email</th>
                                <th className="py-3 px-6 text-left font-semibold">Apply Date</th>
                                <th className="py-3 px-6 text-left font-semibold">Job Title</th>
                                <th className="py-3 px-6 text-left font-semibold">Qualifications</th>
                                <th className="py-3 px-6 text-left font-semibold">Gender</th>
                                <th className="py-3 px-6 text-left font-semibold">Address</th>
                                <th className="py-3 px-6 text-left font-semibold">Status</th>
                                <th className="py-3 px-6 text-left font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredApplicants.map((applicant) => (
                                <tr key={applicant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <td className="py-4 px-6 whitespace-nowrap text-gray-800 dark:text-gray-200">
                                        {applicant.username}
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap text-gray-800 dark:text-gray-200">
                                        {applicant.userEmail}
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap text-gray-800 dark:text-gray-200">
                                        {formatDate(applicant.applyDate)}
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap text-gray-800 dark:text-gray-200">
                                        {applicant.jobTitle}
                                    </td>
                                    <td className="py-4 px-6 whitespace-normal text-gray-800 dark:text-gray-200">
                                        {applicant.qualifications}
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap text-gray-800 dark:text-gray-200">
                                        {applicant.gender}
                                    </td>
                                    <td className="py-4 px-6 whitespace-normal text-gray-800 dark:text-gray-200">
                                        {applicant.address}
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap text-gray-800 dark:text-gray-200">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            applicant.status === 'ACCEPTED' 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {applicant.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap space-x-2">
                                        {applicant.status !== 'ACCEPTED' && (
                                            <button
                                                onClick={() => handleAcceptApplicant(applicant.id)}
                                                className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors flex items-center"
                                            >
                                                <Check className="mr-1" size={16} />
                                                Accept
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteJobDocument(applicant.id)}
                                            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm font-medium transition-colors flex items-center"
                                        >
                                            <Trash2 className="mr-1" size={16} />
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}