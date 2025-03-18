import React, { useState, useEffect } from 'react';
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import Swal from 'sweetalert2';

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

    const getData = () => {
        if (!token) {
            setError("You are not authorized. Please log in again.");
            setLoading(false);
            return;
        }

        instance.get('/job/getAllJobs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            setJobs(response.data.content);
            setLoading(false);
        })
        .catch(async (error) => {
            if (error.response && error.response.status === 403) {
                const newToken = await refreshToken();
                getData(newToken);
            } else {
                setError("Failed to load jobs.");
                setLoading(false);
            }
        });
    };

    useEffect(() => {
        getData(); 

        const refreshInterval = setInterval(() => {
            getData();
        }, 50); 

        return () => clearInterval(refreshInterval); 
    }, []);

    const handleDelete = (id) => {
        instance.delete(`/job/deleteJob/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            setJobs(jobs.filter(job => job.jobId !== id));
            successMessage();
        })
        .catch(err => {
            errorMessage();
        });
    };

    const handleUpdate = (job) => {
        setJobToUpdate(job);
        setJobTitle(job.jobTitle);
        setJobDescription(job.jobDescription);
        setJobQualifications(job.qualifications);
        setJobClosingDate(job.jobClosingDate);
        setModalOpen(true);
    };

    const handleSubmitUpdate = (e) => {
        e.preventDefault();

        const updatedJob = { 
            jobId: jobToUpdate.jobId,  
            jobTitle,
            jobDescription,
            qualifications: jobQualifications,
            jobClosingDate
        };

        instance.put(`/job/updateJob`, updatedJob, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            const updatedJobs = jobs.map(job => 
                job.jobId === jobToUpdate.jobId ? { ...job, ...response.data } : job
            );
            setJobs(updatedJobs);
            setModalOpen(false);
            successMessage();
        })
        .catch(err => {
            errorMessage("Failed to update job.");
        });
    };

    return (
        <div className="overflow-x-auto">
            {loading && <div className="text-center">Loading...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}
{/* 
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={getData}
                    className="bg-blue-500 text-white py-1 px-4 rounded"
                >
                    Refresh
                </button>
            </div>  */}

            <table className="min-w-full table-auto border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="py-1 px-2 text-left">Job Title</th>
                        <th className="py-1 px-2 text-left">Description</th>
                        <th className="py-1 px-2 text-left">Qualifications</th>
                        <th className="py-1 px-2 text-left">Closing Date</th>
                        <th className="py-1 px-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job) => (
                        <tr key={job.jobId} className="border-b">
                            <td className="py-1 px-2">{job.jobTitle}</td>
                            <td className="py-1 px-2">{job.jobDescription}</td>
                            <td className="py-1 px-2">{job.qualifications}</td>
                            <td className="py-1 px-2">{job.jobClosingDate}</td>
                            <td className="py-1 px-2">
                                <button
                                    onClick={() => handleUpdate(job)}
                                    className="bg-yellow-500 text-white py-1 px-2 rounded mr-2 text-xs"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => handleDelete(job.jobId)}
                                    className="bg-red-500 text-white py-1 px-2 rounded text-xs"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-72">
                        <h2 className="text-2xl font-bold mb-4">Update Job</h2>
                        <form onSubmit={handleSubmitUpdate}>
                            <div className="mb-4">
                                <label htmlFor="jobTitle" className="block text-sm font-medium">Job Title</label>
                                <input 
                                    type="text" 
                                    id="jobTitle" 
                                    value={jobTitle} 
                                    onChange={(e) => setJobTitle(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="jobDescription" className="block text-sm font-medium">Job Description</label>
                                <input 
                                    type="text" 
                                    id="jobDescription" 
                                    value={jobDescription} 
                                    onChange={(e) => setJobDescription(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="jobQualifications" className="block text-sm font-medium">Job Qualifications</label>
                                <input 
                                    type="text" 
                                    id="jobQualifications" 
                                    value={jobQualifications} 
                                    onChange={(e) => setJobQualifications(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="jobClosingDate" className="block text-sm font-medium">Job Closing Date</label>
                                <input 
                                    type="date" 
                                    id="jobClosingDate" 
                                    value={jobClosingDate} 
                                    onChange={(e) => setJobClosingDate(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                           
                            <div className="flex justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setModalOpen(false)} 
                                    className="mr-2 bg-gray-500 text-white py-1 px-4 rounded"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-blue-500 text-white py-1 px-4 rounded"
                                >
                                    Update
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
