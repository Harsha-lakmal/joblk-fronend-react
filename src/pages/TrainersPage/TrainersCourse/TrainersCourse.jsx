import React, { useState, useEffect } from 'react';
import Banner from '../../../comon/Banner/Banner';
import AddCourse from '../../../comon/AddCourse/AddCourse';
import joblkimg from '../../../Assets/joblk.png';
import { instance } from "../../../Service/AxiosHolder/AxiosHolder";
import { CircleUserRound, X } from 'lucide-react';
import Swal from 'sweetalert2';
import TrainersHeader from '../../../Headers/TrainersHeader';

function TrainersCourse() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseImages, setCourseImages] = useState({});
  const [uploadDates, setUploadDates] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
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

  useEffect(() => {
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    getData();
    const interval = setInterval(checkForChanges, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const getData = async () => {
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
        setUploadDates(prev => ({
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

  const checkForChanges = async () => {
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
          setUploadDates(prev => ({
            ...prev,
            [course.courseId]: course.dateUpload ? new Date(course.dateUpload).toLocaleDateString() : 'N/A'
          }));
        });
      }
    } catch (error) {
      console.error("Failed to check for course updates:", error);
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

  const handleTallyClick = async (course) => {
    setSelectedCourse(course);
    const userData = await fetchUserDetails(course.userId);
    if (userData) {
      setUserDetails(userData);
      setShowPopup(true);
    } else {
      showErrorMessage("Could not fetch user details");
    }
  };

  const handleCourseAdded = (newCourse) => {
    setCourses(prev => [...prev, newCourse]);
    getCourseImage(newCourse.courseId);
    setUploadDates(prev => ({
      ...prev,
      [newCourse.courseId]: newCourse.dateUpload ? new Date(newCourse.dateUpload).toLocaleDateString() : 'N/A'
    }));
  };

  useEffect(() => {
    return () => {
      Object.values(courseImages).forEach(url => URL.revokeObjectURL(url));
    };
  }, [courseImages]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <TrainersHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Compact Popup Window */}
        {showPopup && selectedCourse && (
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
                <span className="truncate">{uploadDates[selectedCourse.courseId] || 'N/A'}</span>
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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{ color: "#6495ED" }}>
                  Course Opportunities
                </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <AddCourse onCourseAdded={handleCourseAdded} />
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && <div className="text-center col-span-full">Loading courses...</div>}
                {error && <div className="text-center col-span-full text-red-500">{error}</div>}

                {courses.length === 0 && !loading && (
                  <div className="col-span-full text-center py-4 text-gray-500 dark:text-gray-400">
                    No courses available at the moment.
                  </div>
                )}

                {courses.map((course) => (
                  <div key={course.courseId} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform duration-300 h-full">
                    {/* Image Section with Title Overlay */}
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

                    {/* Course Details */}
                    <div className="p-5 flex-grow">
                      <ul className="space-y-3 text-sm">
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

                    {/* Action Button */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                     
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

export default TrainersCourse;