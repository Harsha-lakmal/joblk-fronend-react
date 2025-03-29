import React, { useState, useEffect } from 'react';
import Header from '../../../partials/Header';
import Banner from '../../../comon/Banner/Banner';
import TrainersSidebar from '../../../partials/TrainersSidebar';
import joblkimg from '../../../Assets/joblk.png';
import { instance } from "../../../Service/AxiosHolder/AxiosHolder";
import Swal from "sweetalert2";

function TrainersDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobImages, setJobImages] = useState({});
  const [courseImages, setCourseImages] = useState({});
  const token = localStorage.getItem("authToken");

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

  // Single useEffect for initial data loading
  useEffect(() => {
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    // Initial data fetch
    getJobsData();
    getCoursesData();
    
    // Set up intervals for checking updates
    const jobsInterval = setInterval(() => {
      getJobsData();
    }, 40000);
    
    const coursesInterval = setInterval(() => {
      checkForCourseChanges();
    }, 4000);

    // Clean up intervals on component unmount
    return () => {
      clearInterval(jobsInterval);
      clearInterval(coursesInterval);
    };
  }, [token]);

  // Function to fetch all jobs
  const getJobsData = () => {
    if (!token) return;
    
    instance
      .get("/job/getAllJobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setJobs(response.data.content);
        const newImages = {};
        response.data.content.forEach((job) => {
          getJobImage(job.jobId, newImages);
        });
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load jobs.");
        setLoading(false);
        console.error(error);
      });
  };

  // Function to fetch job image
  const getJobImage = (jobId, newImages = {}) => {
    instance
      .get(`/job/get/image/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })
      .then((res) => {
        newImages[jobId] = URL.createObjectURL(res.data);
        setJobImages((prevImages) => ({ ...prevImages, ...newImages }));
      })
      .catch((err) => {
        console.error("Error fetching job image:", err);
      });
  };

  // Function to fetch all courses
  const getCoursesData = () => {
    instance.get('/course/getAllCourse', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setCourses(response.data.content);
      setLoading(false);

      // Fetch image for each course
      response.data.content.forEach(course => {
        getCourseImage(course.courseId);
      });
    })
    .catch(error => {
      setError("Failed to load courses.");
      setLoading(false);
      console.error(error);
    });
  };

  // Function to fetch image for each course
  const getCourseImage = (courseId) => {
    instance.get(`/course/get/image/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob'
    })
    .then(res => {
      const imageUrl = URL.createObjectURL(res.data);
      setCourseImages(prevImages => ({
        ...prevImages,
        [courseId]: imageUrl
      }));
    })
    .catch(err => {
      console.error('Error fetching course image:', err);
    });
  };

  // Function to check for changes in courses
  const checkForCourseChanges = () => {
    instance
      .get('/course/getAllCourse', { 
        headers: { 
          'Authorization': `Bearer ${token}` 
        } 
      })
      .then((response) => {
        const newCourses = response.data.content;
        
        // Check if courses have changed by comparing course IDs and length
        const currentIds = courses.map(course => course.courseId).sort().join(',');
        const newIds = newCourses.map(course => course.courseId).sort().join(',');
        
        if (currentIds !== newIds || courses.length !== newCourses.length) {
          console.log('Changes detected, updating course list...');
          setCourses(newCourses);
          
          // Check for new courses that need images
          newCourses.forEach((course) => {
            if (!courseImages[course.courseId]) {
              getCourseImage(course.courseId);
            }
          });
        }
      })
      .catch((error) => console.error('Error checking for course updates:', error));
  };

  // Function to handle CV upload
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

  // Function to handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
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
    <div className="flex h-screen overflow-hidden">
      <TrainersSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            {/* Jobs Section */}
            <div className="mb-10">
              <div className="sm:flex sm:justify-between sm:items-center mb-8">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{color :"#6495ED"}}>Job opportunity</h1>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.length === 0 ? (
                  <div className="col-span-full text-center py-4">No jobs available at the moment.</div>
                ) : (
                  jobs.map((job) => (
                    <div
                      key={job.jobId}
                      className="bg-white dark:bg-gray-800 shadow-xl rounded-xl flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      <div className="relative w-full h-56">
                        <img
                          src={jobImages[job.jobId] || "/path/to/default/image.jpg"}
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
                          <label htmlFor={`file-upload-${job.jobId}`} className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                            Upload Your CV:
                          </label>
                          <div className="mt-2 flex items-center space-x-4">
                            <input 
                              id={`file-upload-${job.jobId}`} 
                              type="file" 
                              accept=".pdf, .docx, .txt" 
                              className="hidden" 
                              onChange={handleFileChange} 
                            />
                          
                            <button 
                              type="button" 
                              onClick={cvUploadHandle} 
                              className="bg-blue-500 text-white py-2 px-4 rounded-md"
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
            </div>

            {/* Courses Section */}
            <div>
              <div className="sm:flex sm:justify-between sm:items-center mb-8">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{color :"#6495ED"}}>Course opportunity</h1>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.length === 0 ? (
                  <div className="col-span-full text-center py-4">No courses available at the moment.</div>
                ) : (
                  courses.map(course => (
                    <div 
                      key={course.courseId} 
                      className="bg-white dark:bg-gray-800 shadow-xl rounded-xl flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                        <h2 className="font-bold text-3xl text-gray-800 dark:text-gray-100">{course.courseTitle}</h2>
                      </header>
                      <div className="flex flex-col items-center p-4">
                        <div className="mb-6">
                          <img 
                            src={courseImages[course.courseId] || joblkimg} 
                            alt="Course Image"
                            className="w-72 h-72 object-cover rounded-lg"
                          />
                        </div>
                        <ul className="space-y-6 text-left w-full">
                          <li className="flex items-start space-x-3">
                            <div className="flex-1">
                              <span className="font-medium text-lg text-gray-800 dark:text-gray-100">Course Description:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{course.courseDescription}</p>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="flex-1">
                              <span className="font-medium text-lg text-gray-800 dark:text-gray-100">Course Content:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{course.courseContent}</p>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="flex-1">
                              <span className="font-medium text-lg text-gray-800 dark:text-gray-100">Course Qualifications:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{course.courseQualification}</p>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="flex-1">
                              <span className="font-medium text-lg text-gray-800 dark:text-gray-100">Course Start Date:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{course.courseStartDate}</p>
                            </div>
                          </li>
                          <li className="flex items-start space-x-3">
                            <div className="flex-1">
                              <span className="font-medium text-lg text-gray-800 dark:text-gray-100">Course Location:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{course.courseLocation}</p>
                            </div>
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

export default TrainersDashboard;