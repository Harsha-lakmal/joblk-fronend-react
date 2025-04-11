import React, { useState, useEffect } from 'react';
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import Swal from 'sweetalert2';
import { Edit, Trash2, X, Plus, CircleUserRound } from 'lucide-react';

function AdminCourseController() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [courseToUpdate, setCourseToUpdate] = useState(null);
    const [courseTitle, setCourseTitle] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [courseLocation, setCourseLocation] = useState('');
    const [courseQualification, setCourseQualification] = useState('');
    const [courseContent, setCourseContent] = useState('');
    const [courseStartDate, setCourseStartDate] = useState('');
    const [loadingAction, setLoadingAction] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [uploadDates, setUploadDates] = useState({});
    const [courseImages, setCourseImages] = useState({});

    const token = localStorage.getItem('authToken');

    const showSuccess = (message = 'Successful') => {
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: message,
            showConfirmButton: false,
            timer: 2000,
        });
    };

    const showError = (message = 'Operation failed') => {
        Swal.fire({
            position: "top-end",
            icon: "error",
            title: message,
            showConfirmButton: false,
            timer: 2000,
        });
    };

    const getCourseImage = async (courseId) => {
        try {
            const response = await instance.get(`/course/getCourseImage/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'blob'
            });

            if (response.data) {
                const imageUrl = URL.createObjectURL(response.data);
                setCourseImages(prev => ({
                    ...prev,
                    [courseId]: imageUrl
                }));
            }
        } catch (error) {
            console.error(`Error fetching image for course ${courseId}:`, error);
        }
    };

    const fetchCourses = async () => {
        if (!token) {
            showError("You are not authorized. Please log in again.");
            setLoading(false);
            return;
        }

        try {
            const response = await instance.get('/course/getAllCourseDetails', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCourses(response.data);
            setError(null);

            response.data.forEach((course) => {
                if (!courseImages[course.courseId]) {
                    getCourseImage(course.courseId);
                }

                setUploadDates(prev => ({
                    ...prev,
                    [course.courseId]: course.dateUpload ? new Date(course.dateUpload).toLocaleDateString() : 'N/A'
                }));
            });

        } catch (error) {
            console.error("Error fetching courses:", error);
            setError("Failed to load courses. Please try again.");
            if (error.response?.status === 401 || error.response?.status === 403) {
                showError("Session expired. Please log in again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const deleteCourse = async (id) => {
        const confirm = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (confirm.isConfirmed) {
            setLoadingAction(true);
            try {
                await instance.delete(`/course/deleteCourse/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCourses(courses.filter(course => course.courseId !== id));
                showSuccess("Course deleted successfully");
            } catch (error) {
                console.error("Error deleting course:", error);
                showError("Failed to delete course.");
            } finally {
                setLoadingAction(false);
            }
        }
    };

    const updateCourse = async (e) => {
        e.preventDefault();
        if (!courseToUpdate) return;

        setLoadingAction(true);

        try {
            const updatedCourse = {
                courseId: courseToUpdate.courseId,
                courseTitle,
                courseDescription,
                courseLocation,
                courseQualification,
                courseContent,
                courseStartDate
            };

            const response = await instance.put('/course/updateCourse', updatedCourse, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setCourses(courses.map(course =>
                course.courseId === courseToUpdate.courseId ? response.data : course
            ));
            setModalOpen(false);
            showSuccess("Course updated successfully");
        } catch (error) {
            console.error("Error updating course:", error);
            showError("Failed to update course.");
        } finally {
            setLoadingAction(false);
        }
    };


    const prepareUpdateForm = (course) => {
        setCourseToUpdate(course);
        setCourseTitle(course.courseTitle);
        setCourseDescription(course.courseDescription);
        setCourseLocation(course.courseLocation);
        setCourseQualification(course.courseQualification);
        setCourseContent(course.courseContent);
        setCourseStartDate(course.courseStartDate.split('T')[0]);
        setModalOpen(true);
    };

    const fetchUserDetails = async (userId) => {
        try {
            const response = await instance.get(`/user/getUserId/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return null;
        }
    };

    const handleUserClick = async (course) => {
        setSelectedCourse(course);
        const userData = await fetchUserDetails(course.userId);
        if (userData) {
            setUserDetails(userData);
            setShowPopup(true);
        } else {
            showError("Could not fetch user details");
        }
    };

    useEffect(() => {
        fetchCourses();
        const refreshInterval = setInterval(fetchCourses, 10000);
        return () => clearInterval(refreshInterval);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8">
            <div className="max-w-7xl mx-auto">


                {loading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
                        <p>{error}</p>
                    </div>
                )}

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
                                <span className="truncate">{selectedCourse.courseId ? uploadDates[selectedCourse.courseId] || 'N/A' : 'N/A'}</span>
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

                {!loading && courses.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publisher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {courses.map((course) => (
                                    <tr key={course.courseId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-full">
                                                <CircleUserRound
                                                    className="h-6 w-6 text-blue-600 cursor-pointer"
                                                    onClick={() => handleUserClick(course)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                            {course.courseTitle}
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal max-w-xs text-sm text-gray-500 dark:text-gray-300 line-clamp-2">
                                            {course.courseDescription}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {course.courseLocation}
                                        </td>
                                        <td className="px-6 py-4 whitespace-normal max-w-xs text-sm text-gray-500 dark:text-gray-300 line-clamp-2">
                                            {course.courseQualification}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {new Date(course.courseStartDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => prepareUpdateForm(course)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                                title="Edit"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteCourse(course.courseId)}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {!loading && courses.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-gray-500 dark:text-gray-400">No courses available at the moment.</div>
                    </div>
                )}
            </div>
            {modalOpen && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-100" style={{width : 700  }}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Update Course</h2>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={updateCourse}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="courseTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                                    <input
                                        type="text"
                                        id="courseTitle"
                                        value={courseTitle}
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="courseLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                    <input
                                        type="text"
                                        id="courseLocation"
                                        value={courseLocation}
                                        onChange={(e) => setCourseLocation(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    id="courseDescription"
                                    value={courseDescription}
                                    onChange={(e) => setCourseDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="courseQualification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Qualification</label>
                                <textarea
                                    id="courseQualification"
                                    value={courseQualification}
                                    onChange={(e) => setCourseQualification(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="courseContent" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                                <textarea
                                    id="courseContent"
                                    value={courseContent}
                                    onChange={(e) => setCourseContent(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="courseStartDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    id="courseStartDate"
                                    value={courseStartDate}
                                    onChange={(e) => setCourseStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    disabled={loadingAction}
                                >
                                    {loadingAction ? 'Updating...' : 'Update Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default AdminCourseController;