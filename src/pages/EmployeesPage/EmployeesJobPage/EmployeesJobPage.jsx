import React, { useState, useEffect } from 'react';
import Header from '../../../partials/Header';
import EmployeesSidebar from '../../../partials/EmployeesSidebar';
import AddJob from '../../../comon/AddJobs/AddJobs';
import Banner from '../../../comon/Banner/Banner';
import { instance } from '/src/Service/AxiosHolder/AxiosHolder.jsx';
import joblkimg from '../../../Assets/joblk.png';
import { CircleUserRound, X } from 'lucide-react';

function EmployeesJobPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsImages, setJobsImages] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  
  const token = localStorage.getItem('authToken');

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
    setLoading(true);
    instance
      .get('/job/getAllJobsDetails', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log(response.data);
        setJobs(response.data);
        response.data.forEach((job) => getimg(job.jobId));
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to load jobs.');
        setLoading(false);
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
        setJobsImages((prevImages) => ({
          ...prevImages,
          [jobId]: URL.createObjectURL(res.data),
        }));
      })
      .catch((err) => console.error('Error fetching image:', err));
  };

  const checkForChangesAlternative = () => {
    instance
      .get('/job/getAllJobsDetails', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const newJobs = response.data;
        if (JSON.stringify(newJobs) !== JSON.stringify(jobs)) {
          setJobs(newJobs);
          newJobs.forEach((job) => {
            if (!jobsImages[job.jobId]) getimg(job.jobId);
            fetchUserDetails(job.userId);
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
      console.log(response.data);
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

  return (
    <div className="flex h-screen overflow-hidden">
      <EmployeesSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Compact Popup Window */}
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
            <div>
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{color: "#6495ED"}}>Job opportunity</h1>
              <AddJob onJobAdded={getData} />
            </div>
            {error && <div className="text-center py-4 text-red-500">{error}</div>}
            {loading && jobs.length > 0 && <div className="text-center py-2 text-blue-500">Refreshing data...</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.length === 0 ? (
                <div className="col-span-full text-center py-4">No jobs available at the moment.</div>
              ) : (
                jobs.map((job) => (
                  <div key={job.jobId} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 flex flex-col hover:scale-105 transition-all">
                    <div className="relative w-full h-56">
                      <button 
                        onClick={() => handleTallyClick(job)}
                        className="absolute top-2 right-2 z-10 text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition bg-white dark:bg-gray-700 p-1 rounded-full"
                      >
                        <CircleUserRound size={24} />
                      </button>
                      <img 
                        src={jobsImages[job.jobId] || joblkimg} 
                        alt="Job" 
                        className="w-full h-full object-cover rounded-lg" 
                      />
                    </div>
                    <div className="p-5 flex-grow">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{job.jobTitle}</h2>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">{job.jobDescription}</p>
                      <ul className="mt-4 space-y-3">
                        <li><span className="font-medium">Qualifications:</span> {job.qualifications}</li>
                        <li><span className="font-medium">Closing Date:</span> {new Date(job.jobClosingDate).toLocaleDateString()}</li>
                        <li><span className="font-medium">Location:</span> Panadura</li>
                      </ul>
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