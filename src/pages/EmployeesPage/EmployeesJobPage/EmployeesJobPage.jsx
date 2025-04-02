import React, { useState, useEffect } from 'react';
import Header from '../../../partials/Header';
import EmployeesSidebar from '../../../partials/EmployeesSidebar';
import AddJob from '../../../comon/AddJobs/AddJobs';
import Banner from '../../../comon/Banner/Banner';
import { instance } from '/src/Service/AxiosHolder/AxiosHolder.jsx';
import joblkimg from '../../../Assets/joblk.png';

function EmployeesJobPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsImages, setJobsImages] = useState({});
  const token = localStorage.getItem('authToken');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      .get('/job/getAllJobs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setJobs(response.data.content);
        response.data.content.forEach((job) => getimg(job.jobId));
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
      .get('/job/getAllJobs', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const newJobs = response.data.content;
        if (JSON.stringify(newJobs) !== JSON.stringify(jobs)) {
          console.log('Changes detected, updating job list...');
          setJobs(newJobs);
          newJobs.forEach((job) => {
            if (!jobsImages[job.jobId]) getimg(job.jobId);
          });
        }
      })
      .catch((error) => console.error('Error checking for updates:', error));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <EmployeesSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div>
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{color :"#6495ED"}} >Job opportunity</h1>
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
                      <img src={jobsImages[job.jobId] || joblkimg} alt="Job" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-5">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{job.jobTitle}</h2>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">{job.jobDescription}</p>
                      <ul className="mt-4 space-y-3">
                        <li><span className="font-medium">Qualifications:</span> {job.qualifications}</li>
                        <li><span className="font-medium">Closing Date:</span> {job.jobClosingDate}</li>
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