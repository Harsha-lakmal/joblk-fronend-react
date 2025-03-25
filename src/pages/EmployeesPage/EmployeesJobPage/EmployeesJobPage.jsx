import React, { useState ,useEffect} from 'react';

import Header from '../../../partials/Header';
import FilterButton from '../../../components/DropdownFilter';
import Datepicker from '../../../components/Datepicker';
import Banner from '../../../comon/Banner/Banner';
import EmployeesSidebar from '../../../partials/EmployeesSidebar';
import AddJob  from '../../../comon/AddJobs/AddJobs'
import EmployeesJobsCard from '../../../comon/EmployeesJobsCard/EmployeesJobsCard';
import { instance } from '/src/Service/AxiosHolder/AxiosHolder.jsx';
import joblkimg from "../../../Assets/joblk.png";

function EmployeesJobPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courseImages, setCourseImages] = useState({});
    const token = localStorage.getItem('authToken');

  const [sidebarOpen, setSidebarOpen] = useState(false);



    useEffect(() => {
      if (token) {
        getData(); // Fetch jobs if the token exists
      } else {
        setError('No authentication token found.');
        setLoading(false);
      }
    }, [token]);
  
    useEffect(() => {
      const interval = setInterval(() => {
        if (token) {
          checkForChanges(); // Use this for periodic checks
        }
      }, 4000);
  
      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }, [token]);
  
    const getData = () => {
      setLoading(true); // Set loading true before fetching data
      instance
        .get('/job/getAllJobs', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
        .then((response) => {
          setJobs(response.data.content);
          response.data.content.forEach((job) => {
            getimg(job.jobId);
          });
          setLoading(false);
        })
        .catch((error) => {
          setError('Failed to load jobs.');
          setLoading(false);
          console.error(error);
        });
    };
  
    const getimg = (jobId) => {
      instance
        .get(`/job/get/image/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          responseType: 'blob',
        })
        .then((res) => {
          const imageUrl = URL.createObjectURL(res.data);
          setCourseImages((prevImages) => ({
            ...prevImages,
            [jobId]: imageUrl, // Store the image URL in state
          }));
        })
        .catch((err) => {
          console.error('Error fetching image:', err.response || err);
        });
    };
  
    const checkForChanges = () => {
      // Implement logic to check for changes if necessary
      console.log('Checking for changes...');
    };
  
    if (loading) {
      return <div className="text-center py-4">Loading...</div>;
    }
  
    if (error) {
      return <div className="text-center py-4 text-red-500">{error}</div>;
    }

  return (
    <div className="flex h-screen overflow-hidden">

      <EmployeesSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            <div className="sm:flex sm:justify-between sm:items-center mb-8">

              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold"> Job Page</h1>
              </div>

              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <AddJob/>
                
                            
              </div>

            </div>

            <div>
         
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
            </div>
          </div>
        ))
      )}
    </div>

              
            </div>

          </div>
        </main>

        <Banner />

      </div>
    </div>
  );
}

export default EmployeesJobPage;