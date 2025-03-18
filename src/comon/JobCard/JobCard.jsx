import React, { useState, useEffect } from 'react';
import { instance } from '/src/Service/AxiosHolder/AxiosHolder.jsx'; 

function JobCard() {
  const [jobs, setJobs] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [courseImages, setCourseImages] = useState({}); 
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }
    getData();
    const interval = setInterval(() => {
      getData();
    }, 40000);

    return () => clearInterval(interval);
  }, []);

  function getData() {
    if (!token) return;
    instance
      .get('/job/getAllJobs', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      .then((response) => {
        setJobs(response.data.content);
        const newImages = {};
        response.data.content.forEach((job) => {
          getimg(job.jobId, newImages);
        });
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to load jobs.');
        setLoading(false);
        console.error(error);
      });
  }

  const getimg = (jobId, newImages) => {
    instance
      .get(`/job/get/image/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob',
      })
      .then((res) => {
        newImages[jobId] = URL.createObjectURL(res.data);
        setCourseImages((prevImages) => ({ ...prevImages, ...newImages }));
      })
      .catch((err) => {
        console.error('Error fetching image:', err);
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      // Implement upload logic here
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.length === 0 ? (
        <div className="col-span-full text-center py-4">No jobs available at the moment.</div>
      ) : (
        jobs.map((job) => (
          <div
            key={job.jobId}
            className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <div className="relative w-full h-56">
              <img
                src={courseImages[job.jobId] || '/path/to/default/image.jpg'} 
                alt="Job Image"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{job.jobTitle}</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{job.jobDescription}</p>
              <ul className="mt-4 space-y-3">
                <li>
                  <span className="font-medium text-gray-800 dark:text-gray-100">Qualifications:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.qualifications}</p>
                </li>
                <li>
                  <span className="font-medium text-gray-800 dark:text-gray-100">Closing Date:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{job.jobClosingDate}</p>
                </li>
                <li>
                  <span className="font-medium text-gray-800 dark:text-gray-100">Location:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Panadura</p>
                </li>
              </ul>
              <div className="mt-6">
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                  Upload Your CV:
                </label>
                <div className="mt-2 flex items-center space-x-4">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf, .docx, .txt"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('file-upload').click()}
                    className="bg-blue-500 text-white py-2 px-10 rounded-md"
                  >
                    Upload CV
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default JobCard;
