import React, { useState, useEffect } from 'react';
import Banner from '../../../comon/Banner/Banner';
import joblkimg from '../../../Assets/joblk.png';
import { instance } from "../../../Service/AxiosHolder/AxiosHolder";
import Swal from "sweetalert2";
import { CircleUserRound, X } from 'lucide-react';
import TrainersHeader from '../../../Headers/TrainersHeader';


function TrainersHome() {
  const [jobs, setJobs] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsImages, setJobsImages] = useState({});
  const [courseImages, setCourseImages] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [uploadDates, setUploadDates] = useState({});
  const [courseUploadDates, setCourseUploadDates] = useState({});
  const [activeTab, setActiveTab] = useState('jobs');
  const token = localStorage.getItem('authToken');

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

  useEffect(() => {
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    getJobsData();
    getCoursesData();
    const interval = setInterval(() => {
      checkForJobChanges();
      checkForCourseChanges();
    }, 10000);

    return () => clearInterval(interval);
  }, [token]);

  // Jobs related functions
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

  // Courses related functions
  const getCoursesData = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/course/getAllCourseDetails", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedCourses = response.data;
      setCourses(fetchedCourses);

      fetchedCourses.forEach((course) => {
        if (!courseImages[course.courseId]) {
          getCourseImage(course.courseId);
        }
        setCourseUploadDates(prev => ({
          ...prev,
          [course.courseId]: course.dateUpload ? new Date(course.dateUpload).toLocaleDateString() : 'N/A'
        }));
      });

      setLoading(false);
    } catch (error) {
      setError("Failed to load courses.");
      setLoading(false);
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
      const response = await instance.get("/course/getAllCourseDetails", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newCourses = response.data;
      if (JSON.stringify(newCourses) !== JSON.stringify(courses)) {
        setCourses(newCourses);
        newCourses.forEach((course) => {
          if (!courseImages[course.courseId]) {
            getCourseImage(course.courseId);
          }
          setCourseUploadDates(prev => ({
            ...prev,
            [course.courseId]: course.dateUpload ? new Date(course.dateUpload).toLocaleDateString() : 'N/A'
          }));
        });
      }
    } catch (error) {
      console.error("Failed to check for course updates:", error);
    }
  };

  // Common functions
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

  // Cleanup effects
  useEffect(() => {
    return () => {
      Object.values(jobsImages).forEach(url => URL.revokeObjectURL(url));
      Object.values(courseImages).forEach(url => URL.revokeObjectURL(url));
    };
  }, [jobsImages, courseImages]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <TrainersHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Compact Popup Window */}
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
                  {selectedItem.jobId 
                    ? uploadDates[selectedItem.jobId] || 'N/A'
                    : courseUploadDates[selectedItem.courseId] || 'N/A'}
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
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'jobs' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('jobs')}
              >
                Job Opportunities
              </button>
              <button
                className={`py-2 px-4 font-medium ${activeTab === 'courses' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('courses')}
              >
                Course Opportunities
              </button>
            </div>

            {error && <div className="text-center py-4 text-red-500">{error}</div>}
            {loading && <div className="text-center py-4">Loading...</div>}

            {activeTab === 'jobs' ? (
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
                      </div>

                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <button 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition"
                          onClick={cvUploadHandle}
                        >
                          Apply Now
                        </button>
                
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.length === 0 && !loading ? (
                  <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
                    No courses available at the moment.
                  </div>
                ) : (
                  courses.map((course) => (
                    <div key={course.courseId} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300 h-full">
                      {/* Image with title overlay */}
                      <div className="relative h-48 w-full">
                        <img 
                          src={courseImages[course.courseId] || joblkimg} 
                          alt="Course" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                          <h2 className="text-xl font-semibold text-white line-clamp-1">
                            {course.courseTitle}
                          </h2>
                        </div>
                        <button 
                          onClick={() => handleTallyClick(course)}
                          className="absolute top-2 right-2 z-10 text-white hover:text-blue-300 transition bg-black/30 p-1 rounded-full"
                        >
                          <CircleUserRound size={24} />
                        </button>
                      </div>

                      {/* Course details */}
                      <div className="p-5 flex-grow">
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-start">
                            <span className="font-medium min-w-[100px]">Description:</span>
                            <span className="flex-1 line-clamp-3">{course.courseDescription}</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium min-w-[100px]">Content:</span>
                            <span className="flex-1 line-clamp-3">{course.courseContent}</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium min-w-[100px]">Qualifications:</span>
                            <span className="flex-1 line-clamp-3">{course.courseQualification}</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium min-w-[100px]">Start Date:</span>
                            <span className="flex-1">{course.courseStartDate}</span>
                          </li>
                          <li className="flex items-start">
                            <span className="font-medium min-w-[100px]">Location:</span>
                            <span className="flex-1">{course.courseLocation}</span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </main>

        <Banner />
      </div>
    </div>
  );
}

export default TrainersHome;