import React, { useState, useEffect } from 'react';
import Banner from '../../../comon/Banner/Banner';
import AddCourse from '../../../comon/AddCourse/AddCourse';
import joblkimg from '../../../Assets/joblk.png';
import { instance } from "../../../Service/AxiosHolder/AxiosHolder";
import { CircleUserRound, X, Trash2, Edit } from 'lucide-react';
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
  const [editingCourse, setEditingCourse] = useState(null);
  const token = localStorage.getItem("authToken");

  const showSuccessMessage = (msg = "Operation successful") => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: msg,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const showErrorMessage = (msg = "Error. Try again later.") => {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: msg,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const showConfirmationDialog = (title, text, confirmCallback) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed!'
    }).then((result) => {
      if (result.isConfirmed) {
        confirmCallback();
      }
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

  const getUserId = () => {
    const storedUserData = localStorage.getItem("userData");
    if (!storedUserData) {
      showErrorMessage("User data not found.");
      return null;
    }
    return JSON.parse(storedUserData).id;
  };

  const getData = async () => {
    try {
      setLoading(true);
      const userId = getUserId();
      if (!userId) return;

      const response = await instance.get(`/course/getCourseUsersId/${userId}`, {
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

  const deleteCourse = (courseId) => {
    showConfirmationDialog(
      "Delete Course",
      "Are you sure you want to delete this course?",
      () => {
        setLoading(true);
        instance.delete(`/course/deleteCourse/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(() => {
            showSuccessMessage("Course deleted successfully");
            getData();
          })
          .catch((error) => {
            setLoading(false);
            showErrorMessage("Failed to delete course");
            console.error(error);
          });
      }
    );
  };

  const startEditing = (course) => {
    setEditingCourse({ ...course });
  };

  const cancelEditing = () => {
    setEditingCourse(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingCourse(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateCourse = () => {
    if (!editingCourse) return;

    setLoading(true);
    instance.put('/course/updateCourse', editingCourse, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        showSuccessMessage("Course updated successfully");
        setEditingCourse(null);
        getData();
      })
      .catch((error) => {
        setLoading(false);
        showErrorMessage("Failed to update course");
        console.error(error);
      });
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
    const userId = getUserId();
    if (!userId || !token) return;
    
    try {
      const response = await instance.get(`/course/getCourseUsersId/${userId}`, {
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

        {/* Edit Course Modal */}
        {editingCourse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg">Edit Course</h3>
                <button 
                  onClick={cancelEditing}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Title</label>
                  <input
                    type="text"
                    name="courseTitle"
                    value={editingCourse.courseTitle}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Description</label>
                  <textarea
                    name="courseDescription"
                    value={editingCourse.courseDescription}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Content</label>
                  <textarea
                    name="courseContent"
                    value={editingCourse.courseContent}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Qualifications</label>
                  <input
                    type="text"
                    name="courseQualification"
                    value={editingCourse.courseQualification}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Start Date</label>
                  <input
                    type="text"
                    name="courseStartDate"
                    value={editingCourse.courseStartDate}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">Location</label>
                  <input
                    type="text"
                    name="courseLocation"
                    value={editingCourse.courseLocation}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={updateCourse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{ color: "#6495ED" }}>
                Your Post for View
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

                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                      <button
                        onClick={() => deleteCourse(course.courseId)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1 px-3 py-1 rounded transition"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                      <button
                        onClick={() => startEditing(course)}
                        className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 flex items-center gap-1 px-3 py-1 rounded transition"
                      >
                        <Edit size={16} /> Edit
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

export default TrainersCourse;