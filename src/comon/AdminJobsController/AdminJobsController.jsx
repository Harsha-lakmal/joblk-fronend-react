import React, { useState, useEffect } from 'react';
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import Swal from 'sweetalert2';
import { CircleUserRound, X, Edit, Trash2 } from 'lucide-react';

function AdminJobsController() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [jobToUpdate, setJobToUpdate] = useState(null);
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jobQualifications, setJobQualifications] = useState('');
    const [jobClosingDate, setJobClosingDate] = useState('');
    const [uploadDates, setUploadDates] = useState({});
    const [showPopup, setShowPopup] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const token = localStorage.getItem('authToken');

    function successMessage() {
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Successful",
            showConfirmButton: false,
            timer: 2000,
        });
    }

    function errorMessage(msg) {
        Swal.fire({
            position: "top-end",
            icon: "error",
            title: msg || "Unsuccessful",
            showConfirmButton: false,
            timer: 2000,
        });
    }

    const refreshToken = async () => {
        try {
            const refreshResponse = await instance.post('/auth/refresh', {
                refreshToken: localStorage.getItem('refreshToken')
            });
            const newToken = refreshResponse.data.token;
            localStorage.setItem('authToken', newToken);
            return newToken;
        } catch (error) {
            errorMessage("Session expired. Please login again.");
            return null;
        }
    };

    const getData = async (currentToken = token) => {
        if (!currentToken) {
            errorMessage("You are not authorized. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await instance.get('/job/getAllJobsDetails', {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            });

            setJobs(response.data);
            const dateUpdates = {};
            response.data.forEach(job => {
                dateUpdates[job.jobId] = job.dateUpload ? new Date(job.dateUpload).toLocaleDateString() : 'N/A';
            });
            setUploadDates(dateUpdates);
            setLoading(false);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                const newToken = await refreshToken();
                if (newToken) {
                    getData(newToken);
                } else {
                    setLoading(false);
                }
            } else {
                setError("Failed to load jobs. Please try again later.");
                errorMessage("Failed to load jobs.");
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        getData();
        const refreshInterval = setInterval(getData, 10000);
        return () => clearInterval(refreshInterval);
    }, []);

    const handleDelete = (id) => {
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
                instance.delete(`/job/deleteJob/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                    .then(() => {
                        setJobs(jobs.filter(job => job.jobId !== id));
                        successMessage();
                    })
                    .catch(async (err) => {
                        if (err.response && err.response.status === 403) {
                            const newToken = await refreshToken();
                            if (newToken) {
                                handleDelete(id);
                            }
                        } else {
                            errorMessage("Failed to delete job.");
                        }
                    });
            }
        });
    };

    const handleUpdate = (job) => {
        setJobToUpdate(job);
        setJobTitle(job.jobTitle);
        setJobDescription(job.jobDescription);
        setJobQualifications(job.qualifications);
        const dateValue = job.jobClosingDate ? job.jobClosingDate.split('T')[0] : '';
        setJobClosingDate(dateValue);
        setModalOpen(true);
    };

    const handleSubmitUpdate = async (e) => {
        e.preventDefault();

        const updatedJob = {
            jobId: jobToUpdate.jobId,
            jobTitle,
            jobDescription,
            qualifications: jobQualifications,
            jobClosingDate
        };

        try {
            const response = await instance.put(`/job/updateJob`, updatedJob, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const updatedJobs = jobs.map(job =>
                job.jobId === jobToUpdate.jobId ? { ...job, ...response.data } : job
            );
            setJobs(updatedJobs);
            setModalOpen(false);
            successMessage();
        } catch (err) {
            if (err.response && err.response.status === 403) {
                const newToken = await refreshToken();
                if (newToken) {
                    try {
                        const response = await instance.put(`/job/updateJob`, updatedJob, {
                            headers: {
                                'Authorization': `Bearer ${newToken}`
                            }
                        });

                        const updatedJobs = jobs.map(job =>
                            job.jobId === jobToUpdate.jobId ? { ...job, ...response.data } : job
                        );
                        setJobs(updatedJobs);
                        setModalOpen(false);
                        successMessage();
                    } catch (error) {
                        errorMessage("Failed to update job.");
                    }
                }
            } else {
                errorMessage("Failed to update job.");
            }
        }
    };

    const fetchUserDetails = async (userId) => {
        try {
            const response = await instance.get(`/user/getUserId/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 403) {
                const newToken = await refreshToken();
                if (newToken) {
                    try {
                        const response = await instance.get(`/user/getUserId/${userId}`, {
                            headers: {
                                'Authorization': `Bearer ${newToken}`,
                            },
                        });
                        return response.data;
                    } catch (err) {
                        console.error('Error fetching user details:', err);
                        errorMessage("Failed to fetch user details.");
                        return null;
                    }
                }
            } else {
                console.error('Error fetching user details:', error);
                errorMessage("Failed to fetch user details.");
                return null;
            }
        }
    };

    const handleTallyClick = async (job) => {
        setSelectedJob(job);
        const userData = await fetchUserDetails(job.userId);
        if (userData) {
            setUserDetails(userData);
            setShowPopup(true);
        } else {
            errorMessage("Could not fetch user details");
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8">
            <div className="max-w-7xl mx-auto">
                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                {showPopup && selectedJob && (
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-lg">Publisher Details</h3>
                            <button
                                onClick={() => setShowPopup(false)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                                <span className="font-medium w-20">Name:</span>
                                <span>{userDetails?.username || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium w-20">Role:</span>
                                <span>{userDetails?.role || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium w-20">Email:</span>
                                <span className="truncate">{userDetails?.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center">
                                <span className="font-medium w-20">Upload Date:</span>
                                <span className="truncate">{uploadDates[selectedJob.jobId] || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition"
                                onClick={() => setShowPopup(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {!loading && jobs.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Publisher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualifications</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closing Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                                {jobs.map((job) => (
                                    <tr key={job.jobId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-4 py-4 whitespace-nowrap w-16">
                                            <div className="flex items-center justify-center">
                                                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                                                    <CircleUserRound
                                                        className="h-6 w-6 text-blue-600 cursor-pointer"
                                                        onClick={() => handleTallyClick(job)}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal max-w-xs">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-300 line-clamp-2">{job.jobTitle}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal max-w-xs">
                                            <div className="text-sm text-gray-900 dark:text-gray-300 line-clamp-2">{job.jobDescription}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal max-w-xs">
                                            <div className="text-sm text-gray-900 dark:text-gray-300 line-clamp-2">{job.qualifications}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 dark:text-gray-300">
                                                {job.jobClosingDate ? new Date(job.jobClosingDate).toLocaleDateString() : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleUpdate(job)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                                title="Edit"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(job.jobId)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && jobs.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-gray-500 dark:text-gray-400">No jobs available at the moment.</div>
                    </div>
                )}
            </div>

            {modalOpen && jobToUpdate && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-100">
                    <div >
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Update Job</h2>
                        <form onSubmit={handleSubmitUpdate}>
                            <div className="mb-4">
                                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                                <input
                                    type="text"
                                    id="jobTitle"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</label>
                                <textarea
                                    id="jobDescription"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="jobQualifications" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualifications</label>
                                <textarea
                                    id="jobQualifications"
                                    value={jobQualifications}
                                    onChange={(e) => setJobQualifications(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="jobClosingDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Closing Date</label>
                                <input
                                    type="date"
                                    id="jobClosingDate"
                                    value={jobClosingDate}
                                    onChange={(e) => setJobClosingDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Update Job
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminJobsController;