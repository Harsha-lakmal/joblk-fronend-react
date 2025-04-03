import React, { useState, useEffect } from "react";
import joblkimg from "../../../Assets/joblk.png";
import Header from "../../../partials/Header";
import Banner from "../../../comon/Banner/Banner";
import EmployeesSidebar from "../../../partials/EmployeesSidebar";
import { instance } from "../../../Service/AxiosHolder/AxiosHolder";
import Swal from "sweetalert2";
import { CircleUserRound , X } from 'lucide-react';

function EmployeesCourse() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseImages, setCourseImages] = useState({});
  const token = localStorage.getItem("authToken");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  useEffect(() => {
    getData();
    const interval = setInterval(checkForChanges, 10000);
    return () => clearInterval(interval);
  }, []);

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
          getimg(course.courseId);
        }
      });

      setLoading(false);
    } catch (error) {
      setError("Failed to load courses.");
      setLoading(false);
    }
  };

  const getimg = async (courseId) => {
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
      console.error("Error fetching image:", err);
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
            getimg(course.courseId);
          }
        });
      }
    } catch (error) {
      setError("Failed to check for course updates.");
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await instance.get(`/user/getUserId/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      setUserDetails(response.data);
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
      setShowPopup(true);
    } else {
      showErrorMessage("Could not fetch user details");
    }
  };

  useEffect(() => {
    return () => {
      Object.values(courseImages).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [courseImages]);

  return (
    <div className="flex h-screen overflow-hidden">
      <EmployeesSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{ color: "#6495ED" }}>
                  Course opportunity
                </h1>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && <div className="text-center col-span-full">Loading...</div>}
                {error && <div className="text-center col-span-full text-red-500">{error}</div>}

                {courses.map((course) => (
                  <div key={course.courseId} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 flex flex-col hover:scale-105 transition">
                    <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                      <div className="flex justify-between items-center">
                        <h2 className="font-bold text-3xl text-gray-800 dark:text-gray-100">
                          {course.courseTitle}
                        </h2>
                        <button 
                          onClick={() => handleTallyClick(course)}
                          className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition"
                        >
                          <CircleUserRound  size={24} />
                        </button>
                      </div>
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

                      <button onClick={cvUploadHandle} className="mt-6 bg-blue-500 text-white py-3 px-12 rounded-md text-lg hover:bg-blue-600 transition">
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

export default EmployeesCourse;