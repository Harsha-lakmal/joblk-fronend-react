import React, { useState, useEffect } from 'react';
import Banner from '../../../comon/Banner/Banner';
import { instance } from '/src/Service/AxiosHolder/AxiosHolder.jsx';
import joblkimg from '../../../Assets/joblk.png';
import { CircleUserRound, X } from 'lucide-react';
import EmployeesHeader from '../../../Headers/EmployeesHeader';

function EmployeesHome() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsImages, setJobsImages] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadDates, setUploadDates] = useState({});
  const [filterOption, setFilterOption] = useState('all'); // Default filter: all jobs
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    getJobsData();
    const interval = setInterval(() => {
      checkForJobChanges();
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  // Apply filtering when jobs or filterOption changes
  useEffect(() => {
    filterJobs();
  }, [jobs, filterOption]);

  const filterJobs = () => {
    const now = new Date();
    
    switch (filterOption) {
      case 'expiring-24h':
        // Jobs expiring within the next 24 hours
        const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        setFilteredJobs(jobs.filter(job => {
          const closingDate = new Date(job.jobClosingDate);
          return closingDate > now && closingDate <= oneDayLater;
        }));
        break;
        
      case 'expiring-3d':
        // Jobs expiring within the next 3 days
        const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
        setFilteredJobs(jobs.filter(job => {
          const closingDate = new Date(job.jobClosingDate);
          return closingDate > now && closingDate <= threeDaysLater;
        }));
        break;
        
      case 'expired':
        // Jobs that have already expired
        setFilteredJobs(jobs.filter(job => {
          const closingDate = new Date(job.jobClosingDate);
          return closingDate < now;
        }));
        break;
        
      case 'all':
      default:
        // All jobs
        setFilteredJobs(jobs);
        break;
    }
  };

  const getJobsData = () => {
    setLoading(true);
    instance
      .get('/job/getAllJobsDetails', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setJobs(response.data);
        response.data.forEach((job) => {
          getJobImage(job.jobId);
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

  const getJobImage = (jobId) => {
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
      .catch((err) => console.error('Error fetching job image:', err));
  };

  const checkForJobChanges = () => {
    instance
      .get('/job/getAllJobsDetails', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const newJobs = response.data;
        if (JSON.stringify(newJobs) !== JSON.stringify(jobs)) {
          setJobs(newJobs);
          newJobs.forEach((job) => {
            if (!jobsImages[job.jobId]) getJobImage(job.jobId);
            setUploadDates(prev => ({
              ...prev,
              [job.jobId]: job.dateUpload ? new Date(job.dateUpload).toLocaleDateString() : 'N/A'
            }));
          });
        }
      })
      .catch((error) => console.error('Error checking for job updates:', error));
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

  const handleTallyClick = async (item) => {
    setSelectedItem(item);
    const userData = await fetchUserDetails(item.userId);
    if (userData) {
      setUserDetails(userData);
      setShowPopup(true);
    } else {
      console.error("Could not fetch user details");
    }
  };

  const handleFilterChange = (option) => {
    setFilterOption(option);
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

        {showPopup && selectedItem && (
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
                <span className="truncate">
                  {uploadDates[selectedItem.jobId] || 'N/A'}
                </span>
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold" style={{color: "#6495ED"}}>Job Post</h1>
              
              {/* Filter options */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleFilterChange('expiring-24h')}
                  className={`px-3 py-1 rounded text-sm transition ${filterOption === 'expiring-24h' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Expiring in 24h
                </button>
                <button 
                  onClick={() => handleFilterChange('expiring-3d')}
                  className={`px-3 py-1 rounded text-sm transition ${filterOption === 'expiring-3d' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Expiring in 3 days
                </button>
                <button 
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 py-1 rounded text-sm transition ${filterOption === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  All Posts
                </button>
                <button 
                  onClick={() => handleFilterChange('expired')}
                  className={`px-3 py-1 rounded text-sm transition ${filterOption === 'expired' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Expired Posts
                </button>
              </div>
            </div>

            {error && <div className="text-center py-4 text-red-500">{error}</div>}
            {loading && <div className="text-center py-4">Loading...</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.length === 0 && !loading ? (
                <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
                  No jobs available with the current filter.
                </div>
              ) : (
                filteredJobs.map((job) => (
                  <div key={job.jobId} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300 h-full">
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

                    <div className="p-5 flex-grow">
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
                          <span className={`text-gray-700 dark:text-gray-300 ${new Date(job.jobClosingDate) < new Date() ? 'text-red-500' : ''}`}>
                            {new Date(job.jobClosingDate).toLocaleDateString()}
                          </span>
                        </li>
                        <li className="flex">
                          <span className="font-medium min-w-[110px]">Location:</span>
                          <span className="text-gray-700 dark:text-gray-300">Panadura</span>
                        </li>
                      </ul>
                    </div>

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      {new Date(job.jobClosingDate) < new Date() ? (
                        <span className="text-red-500 font-medium text-sm">Expired</span>
                      ) : (
                        <span className="text-green-500 font-medium text-sm">Active</span>
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

export default EmployeesHome;