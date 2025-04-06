import React, { useState, useEffect } from 'react';
import AddJob from '../../../comon/AddJobs/AddJobs';
import Banner from '../../../comon/Banner/Banner';
import { instance } from '/src/Service/AxiosHolder/AxiosHolder.jsx';
import joblkimg from '../../../Assets/joblk.png';
import { CircleUserRound, X, Trash2, Edit } from 'lucide-react';
import Swal from "sweetalert2";
import EmployeesHeader from '../../../Headers/EmployeesHeader';

function EmployeesJobPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsImages, setJobsImages] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadDates, setUploadDates] = useState({});
  const [editingJob, setEditingJob] = useState(null);
  const token = localStorage.getItem('authToken');

  const showSuccessMessage = (message) => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: message || "Successfully completed.",
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

  const showConfirmationDialog = (title, text, confirmCallback) => {
    Swal.fire({
      title: title || "Are you sure?",
      text: text || "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, proceed"
    }).then((result) => {
      if (result.isConfirmed) {
        confirmCallback();
      }
    });
  };

  useEffect(() => {
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    getData();
    const interval = setInterval(() => {
      checkForChangesAlternative();
    }, 4000);

    return () => clearInterval(interval);
  }, [token]);

  const getData = () => {
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData) {
      showErrorMessage("User data not found.");
      return;
    }

    const parsedUserData = JSON.parse(storedUserData);
    const userId = parsedUserData.id;

    if (!userId || !token) return;

    setLoading(true);
    instance.get('/job/getJobsUsersId/' + userId, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setJobs(response.data);
        response.data.forEach((job) => {
          getimg(job.jobId);
          setUploadDates(prev => ({
            ...prev,
            [job.jobId]: job.dateUpload ? new Date(job.dateUpload).toLocaleDateString() : 'N/A'
          }));
        });
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to load jobs.');
        setLoading(false);
        console.error(error);
      });
  };

  const deleteJob = (jobId) => {
    showConfirmationDialog(
      "Delete Job",
      "Are you sure you want to delete this job posting?",
      () => {
        setLoading(true);
        instance.delete(`/job/deleteJob/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((response) => {
            showSuccessMessage("Job deleted successfully");
            getData(); // Refresh the job list
          })
          .catch((error) => {
            setLoading(false);
            showErrorMessage("Failed to delete job");
            console.error(error);
          });
      }
    );
  };

  const startEditing = (job) => {
    setEditingJob({ ...job });
  };

  const cancelEditing = () => {
    setEditingJob(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingJob(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateJob = () => {
    if (!editingJob) return;

    setLoading(true);
    instance.put('/job/updateJob', editingJob, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        showSuccessMessage("Job updated successfully");
        setEditingJob(null);
        getData(); // Refresh the job list
      })
      .catch((error) => {
        setLoading(false);
        showErrorMessage("Failed to update job");
        console.error(error);
      });
  };

  const getimg = (jobId) => {
    if (jobsImages[jobId]) return;

    instance
      .get(`/job/get/image/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      })
      .then((res) => {
        const imageUrl = URL.createObjectURL(res.data);
        setJobsImages((prevImages) => ({
          ...prevImages,
          [jobId]: imageUrl,
        }));
      })
      .catch((err) => console.error('Error fetching image:', err));
  };

  const checkForChangesAlternative = () => {
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData) {
      showErrorMessage("User data not found.");
      return;
    }

    const parsedUserData = JSON.parse(storedUserData);
    const userId = parsedUserData.id;

    if (!userId || !token) return;

    instance.get('/job/getJobsUsersId/' + userId, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const newJobs = response.data;
        if (JSON.stringify(newJobs) !== JSON.stringify(jobs)) {
          setJobs(newJobs);
          newJobs.forEach((job) => {
            if (!jobsImages[job.jobId]) getimg(job.jobId);
            setUploadDates(prev => ({
              ...prev,
              [job.jobId]: job.dateUpload ? new Date(job.dateUpload).toLocaleDateString() : 'N/A'
            }));
          });
        }
      })
      .catch((error) => console.error('Error checking for updates:', error));
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
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const handleTallyClick = async (job) => {
    setSelectedJob(job);
    const userData = await fetchUserDetails(job.userId);
    if (userData) {
      setUserDetails(userData);
      setShowPopup(true);
    } else {
      console.error("Could not fetch user details");
    }
  };

  useEffect(() => {
    return () => {
      Object.values(jobsImages).forEach(url => URL.revokeObjectURL(url));
    };
  }, [jobsImages]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <EmployeesHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold mb-4" style={{ color: "#6495ED" }}>
                Job Opportunities
              </h1>
              <AddJob onJobAdded={getData} />
            </div>

            {error && <div className="text-center py-4 text-red-500">{error}</div>}
            {loading && jobs.length === 0 && <div className="text-center py-4">Loading jobs...</div>}
            {loading && jobs.length > 0 && <div className="text-center py-2 text-blue-500">Refreshing data...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.length === 0 && !loading ? (
                <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
                  No jobs available at the moment.
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job.jobId} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300 h-full">
                    {/* Image with title overlay */}
                    <div className="relative h-48 w-full">
                      <img
                        src={jobsImages[job.jobId] || joblkimg}
                        alt="Job"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <h2 className="text-xl font-semibold text-white line-clamp-1">
                          {job.jobTitle}
                        </h2>
                      </div>
                      <button
                        onClick={() => handleTallyClick(job)}
                        className="absolute top-2 right-2 z-10 text-white hover:text-blue-300 transition bg-black/30 p-1 rounded-full"
                      >
                        <CircleUserRound size={24} />
                      </button>
                    </div>

                    {/* Job details */}
                    <div className="p-5 flex-grow">
                      {editingJob?.jobId === job.jobId ? (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input
                              type="text"
                              name="jobTitle"
                              value={editingJob.jobTitle}
                              onChange={handleEditChange}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                              name="jobDescription"
                              value={editingJob.jobDescription}
                              onChange={handleEditChange}
                              className="w-full p-2 border rounded"
                              rows="3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Qualifications</label>
                            <input
                              type="text"
                              name="qualifications"
                              value={editingJob.qualifications}
                              onChange={handleEditChange}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Closing Date</label>
                            <input
                              type="date"
                              name="jobClosingDate"
                              value={editingJob.jobClosingDate ? editingJob.jobClosingDate.split('T')[0] : ''}
                              onChange={handleEditChange}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                            {job.jobDescription}
                          </p>

                          <ul className="space-y-2 text-sm">
                            <li className="flex">
                              <span className="font-medium min-w-[110px]">Qualifications:</span>
                              <span className="text-gray-700 dark:text-gray-300">{job.qualifications}</span>
                            </li>
                            <li className="flex">
                              <span className="font-medium min-w-[110px]">Closing Date:</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {new Date(job.jobClosingDate).toLocaleDateString()}
                              </span>
                            </li>
                            <li className="flex">
                              <span className="font-medium min-w-[110px]">Location:</span>
                              <span className="text-gray-700 dark:text-gray-300">Panadura</span>
                            </li>
                          </ul>
                        </>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                      {editingJob?.jobId === job.jobId ? (
                        <>
                          <button
                            onClick={cancelEditing}
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 px-3 py-1 rounded transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={updateJob}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition"
                          >
                            Save Changes
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => deleteJob(job.jobId)}
                            className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1 px-3 py-1 rounded transition"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                          <button
                            onClick={() => startEditing(job)}
                            className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1 px-3 py-1 rounded transition"
                          >
                            <Edit size={16} /> Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
        <Banner />
      </div>
    </div>
  );
}

export default EmployeesJobPage;