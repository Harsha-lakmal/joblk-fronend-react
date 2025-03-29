import React, { useState, useEffect } from 'react';
import Datepicker from '../../../components/Datepicker';
import EmployeesSidebar from '../../../partials/EmployeesSidebar';
import Banner from '../../../comon/Banner/Banner';
import Header from '../../../partials/Header';
import { instance } from '/src/Service/AxiosHolder/AxiosHolder.jsx';
import joblkimg from '../../../Assets/joblk.png';
import Swal from 'sweetalert2'; // Make sure to import Swal

function EmployeesDashboard() {
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');
  
  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [jobsImages, setJobsImages] = useState({});
  
  // Courses state
  const [courses, setCourses] = useState([]);
  const [courseImages, setCourseImages] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);

  // Initial data loading
  useEffect(() => {
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    // Load both jobs and courses
    getJobsData();
    getCoursesData();
    
    // Set up periodic checks for updates
    const jobsInterval = setInterval(() => {
      checkForJobChanges();
    }, 10000);
    
    const coursesInterval = setInterval(() => {
      checkForCourseChanges();
    }, 10000);
    
    // Clean up intervals on unmount
    return () => {
      clearInterval(jobsInterval);
      clearInterval(coursesInterval);
      
      // Release object URLs
      Object.values(jobsImages).forEach(url => URL.revokeObjectURL(url));
      Object.values(courseImages).forEach(url => URL.revokeObjectURL(url));
    };
  }, [token]);

  // Jobs related functions
  const getJobsData = () => {
    setLoading(true);
    instance
      .get('/job/getAllJobs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        const jobsData = response.data.content;
        setJobs(jobsData);
        jobsData.forEach((job) => getJobImage(job.jobId));
        setLoading(false);
      })
      .catch((error) => {
        setError('Failed to load jobs.');
        setLoading(false);
        console.error(error);
      });
  };

  const getJobImage = (jobId) => {
    if (jobsImages[jobId]) return; // Avoid redundant fetches
    
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
      .catch((err) => console.error('Error fetching job image:', err));
  };

  const checkForJobChanges = () => {
    instance
      .get('/job/getAllJobs', { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        const newJobs = response.data.content;
        if (JSON.stringify(newJobs) !== JSON.stringify(jobs)) {
          console.log('Changes detected, updating job list...');
          setJobs(newJobs);
          newJobs.forEach((job) => {
            if (!jobsImages[job.jobId]) getJobImage(job.jobId);
          });
        }
      })
      .catch((error) => console.error('Error checking for job updates:', error));
  };

  // Courses related functions
  const getCoursesData = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/course/getAllCourse", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedCourses = response.data.content;
      setCourses(fetchedCourses);

      // Fetch images for courses
      fetchedCourses.forEach((course) => {
        if (!courseImages[course.courseId]) {
          getCourseImage(course.courseId);
        }
      });

      setLoading(false);
    } catch (error) {
      setError("Failed to load courses.");
      setLoading(false);
      console.error(error);
    }
  };

  const getCourseImage = async (courseId) => {
    try {
      const res = await instance.get(`/course/get/image/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const imageUrl = URL.createObjectURL(res.data);
      setCourseImages((prevImages) => ({
        ...prevImages,
        [courseId]: imageUrl,
      }));
    } catch (err) {
      console.error("Error fetching course image:", err);
    }
  };

  const checkForCourseChanges = async () => {
    try {
      const response = await instance.get("/course/getAllCourse", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newCourses = response.data.content;

      if (JSON.stringify(newCourses) !== JSON.stringify(courses)) {
        setCourses(newCourses);
        newCourses.forEach((course) => {
          if (!courseImages[course.courseId]) {
            getCourseImage(course.courseId);
          }
        });
      }
    } catch (error) {
      console.error("Failed to check for course updates:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const cvUploadHandle = async () => {
    try {
      const storedUserData = localStorage.getItem("userData");
      if (!storedUserData) {
        showErrorMessage("User data not found.");
        return;
      }

      const parsedUserData = JSON.parse(storedUserData);
      const userId = parsedUserData.id;
      if (!userId || !token) return;

      const response = await instance.get(`/user/getCvDocument/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      if (response.data) {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log(reader.result);
          showSuccessMessage();
        };
        reader.readAsDataURL(response.data);
      }
    } catch (err) {
      showErrorMessage();
      console.error("Error fetching CV document:", err);
    }
  };

  // Notification functions
  const showSuccessMessage = () => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Successfully uploaded your CV.",
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

  return (
    <div className="flex h-screen overflow-hidden">
      <EmployeesSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Jobs Section */}
            <div className="mb-16">
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{color :"#6495ED"}}>Jobs opportunity</h1>
              </div>
              
              {error && <div className="text-center py-4 text-red-500">{error}</div>}
              {loading && jobs.length > 0 && <div className="text-center py-2 text-blue-500">Refreshing data...</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.length === 0 ? (
                  <div className="col-span-full text-center py-4">No jobs available at the moment.</div>
                ) : (
                  jobs.map((job) => (
                    <div key={job.jobId} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl flex flex-col hover:scale-105 transition-all">
                      <div className="relative w-full h-56">
                        <img src={jobsImages[job.jobId] || joblkimg} alt="Job" className="w-full h-full object-cover rounded-t-xl" />
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

            {/* Courses Section */}
            <div>
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{color :"#6495ED"}} >Course opportunity</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && courses.length === 0 && <div className="text-center col-span-full">Loading...</div>}
                {error && <div className="text-center col-span-full text-red-500">{error}</div>}

                {courses.map((course) => (
                  <div key={course.courseId} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl flex flex-col hover:scale-105 transition">
                    <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                      <h2 className="font-bold text-3xl text-gray-800 dark:text-gray-100">
                        {course.courseTitle}
                      </h2>
                    </header>

                    <div className="flex flex-col items-center p-4">
                      <img src={courseImages[course.courseId] || joblkimg} alt="Course" className="w-72 h-80 object-cover rounded-lg mb-6" />

                      <ul className="space-y-6 text-left w-full">
                        <li><span className="font-medium text-lg">Description:</span> {course.courseDescription}</li>
                        <li><span className="font-medium text-lg">Content:</span> {course.courseContent}</li>
                        <li><span className="font-medium text-lg">Qualifications:</span> {course.courseQualification}</li>
                        <li><span className="font-medium text-lg">Start Date:</span> {course.courseStartDate}</li>
                        <li><span className="font-medium text-lg">Location:</span> {course.courseLocation}</li>
                      </ul>

                      <button onClick={cvUploadHandle} className="mt-6 bg-blue-500 hover:bg-blue-600 text-white py-3 px-12 rounded-md text-lg transition">
                        Upload CV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <Banner />
      </div>
    </div>
  );
}

export default EmployeesDashboard;