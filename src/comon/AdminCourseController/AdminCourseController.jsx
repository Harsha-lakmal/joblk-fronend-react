import React, { useState, useEffect } from 'react';
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import Swal from 'sweetalert2';

function AdminCourseController() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [courseToUpdate, setCourseToUpdate] = useState(null);
    const [courseTitle, setCourseTitle] = useState('');
    const [courseDescription, setCourseDescription] = useState('');
    const [courseLocation, setCourseLocation] = useState('');
    const [courseQualification, setCourseQualification] = useState('');
    const [courseContent, setCourseContent] = useState('');
    const [courseStartDate, setCourseStartDate] = useState('');
    const [imgPath, setImgPath] = useState('');
    const token = localStorage.getItem('authToken');

    function successMessage() {
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Successful",
            showConfirmButton: false,
            timer: 2000,
        });
    }

    function errorMessage(msg) {
        Swal.fire({
            position: "top-end",
            icon: "error",
            title: msg || "Unsuccessful",
            showConfirmButton: false,
            timer: 2000,
        });
    }

    useEffect(() => {
        getData();
    }, []);

    const getData = () => {
        if (!token) {
            setError("You are not authorized. Please log in again.");
            setLoading(false);
            return;
        }

        instance.get('/course/getAllCourse', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            setCourses(response.data.content); 
            setLoading(false);
        })
        .catch(async (error) => {
            if (error.response && error.response.status === 403) {
       
                const newToken = await refreshToken();
                getData(newToken); 
            } else {
                setError("Failed to load courses.");
                setLoading(false);
            }
        });
    };

    const handleDelete = (id) => {
        instance.delete(`/course/deleteCourse/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(() => {
            setCourses(courses.filter(course => course.courseId !== id));
            successMessage();
        })
        .catch(err => {
            errorMessage();
        });
    };

    const handleUpdate = (course) => {
        setCourseToUpdate(course);
        setCourseTitle(course.courseTitle);
        setCourseDescription(course.courseDescription);
        setCourseLocation(course.courseLocation);
        setCourseQualification(course.courseQualification);
        setCourseContent(course.courseContent);
        setCourseStartDate(course.courseStartDate);
        setModalOpen(true);
    };

    const handleSubmitUpdate = (e) => {
        e.preventDefault();

        const updatedCourse = { 
            courseId: courseToUpdate.courseId,  
            courseTitle,
            courseDescription,
            courseLocation,
            courseQualification,
            courseContent,
            courseStartDate
        
        };

        instance.put(`/course/updateCourse`, updatedCourse, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            const updatedCourses = courses.map(course => 
                course.courseId === courseToUpdate.courseId ? { ...course, ...response.data } : course
            );
            setCourses(updatedCourses);
            setModalOpen(false); 
            successMessage();
        })
        .catch(err => {
            errorMessage("Failed to update course.");
        });
    };

    return (
        <div className="overflow-x-auto">
            {loading && <div className="text-center">Loading...</div>}
            {error && <div className="text-center text-red-500">{error}</div>}

            <table className="min-w-full table-auto border-collapse text-sm">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="py-1 px-2 text-left">Title</th>
                        <th className="py-1 px-2 text-left">Description</th>
                        <th className="py-1 px-2 text-left">Location</th>
                        <th className="py-1 px-2 text-left">Qualification</th>
                        <th className="py-1 px-2 text-left">Start Date</th>
                        <th className="py-1 px-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course) => (
                        <tr key={course.courseId} className="border-b">
                            <td className="py-1 px-2">{course.courseTitle}</td>
                            <td className="py-1 px-2">{course.courseDescription}</td>
                            <td className="py-1 px-2">{course.courseLocation}</td>
                            <td className="py-1 px-2">{course.courseQualification}</td>
                            <td className="py-1 px-2">{course.courseStartDate}</td>
                            <td className="py-1 px-2">
                                <button
                                    onClick={() => handleUpdate(course)}
                                    className="bg-yellow-500 text-white py-1 px-2 rounded mr-2 text-xs"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={() => handleDelete(course.courseId)}
                                    className="bg-red-500 text-white py-1 px-2 rounded text-xs"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {modalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-4 rounded-lg w-112 max-h-[500px] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Update Course</h2>
                        <form onSubmit={handleSubmitUpdate}>
                            <div className="mb-4">
                                <label htmlFor="courseTitle" className="block text-sm font-medium">Course Title</label>
                                <input 
                                    type="text" 
                                    id="courseTitle" 
                                    value={courseTitle} 
                                    onChange={(e) => setCourseTitle(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="courseDescription" className="block text-sm font-medium">Course Description</label>
                                <input 
                                    type="text" 
                                    id="courseDescription" 
                                    value={courseDescription} 
                                    onChange={(e) => setCourseDescription(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="courseLocation" className="block text-sm font-medium">Course Location</label>
                                <input 
                                    type="text" 
                                    id="courseLocation" 
                                    value={courseLocation} 
                                    onChange={(e) => setCourseLocation(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="courseQualification" className="block text-sm font-medium">Course Qualification</label>
                                <input 
                                    type="text" 
                                    id="courseQualification" 
                                    value={courseQualification} 
                                    onChange={(e) => setCourseQualification(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="courseContent" className="block text-sm font-medium">Course Content</label>
                                <textarea 
                                    id="courseContent" 
                                    value={courseContent} 
                                    onChange={(e) => setCourseContent(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="courseStartDate" className="block text-sm font-medium">Course Start Date</label>
                                <input 
                                    type="date" 
                                    id="courseStartDate" 
                                    value={courseStartDate} 
                                    onChange={(e) => setCourseStartDate(e.target.value)} 
                                    className="w-full p-2 border rounded"
                                    required 
                                />
                            </div>
                           
                            <div className="flex justify-end">
                                <button 
                                    type="button" 
                                    onClick={() => setModalOpen(false)} 
                                    className="mr-2 bg-gray-500 text-white py-1 px-4 rounded"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="bg-blue-500 text-white py-1 px-4 rounded"
                                >
                                    Update
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
