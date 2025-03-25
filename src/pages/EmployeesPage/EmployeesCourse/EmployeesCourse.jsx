import React, { useState, useEffect } from "react";
import joblkimg from "../../../Assets/joblk.png";
import Header from "../../../partials/Header";
import Banner from "../../../comon/Banner/Banner";
import EmployeesSidebar from "../../../partials/EmployeesSidebar";
import { instance } from "../../../Service/AxiosHolder/AxiosHolder"; 

function EmployeesCourse() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseImages, setCourseImages] = useState({});
  const token = localStorage.getItem("authToken");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  useEffect(() => {
    getData();
    const interval = setInterval(() => {
      checkForChanges();
    }, 10000); 

    return () => clearInterval(interval);
  }, []);

  const getData = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/course/getAllCourse", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchedCourses = response.data.content;

      if (JSON.stringify(fetchedCourses) !== JSON.stringify(courses)) {
        setCourses(fetchedCourses);

        fetchedCourses.forEach((course) => {
          if (!courseImages[course.courseId]) {
            getimg(course.courseId);
          }
        });
      }

      setLoading(false);
    } catch (error) {
      setError("Failed to load courses.");
      setLoading(false);
    }
  };

  const getimg = async (courseId) => {
    try {
      const res = await instance.get(`/course/get/image/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(res.data);

      setCourseImages((prevImages) => ({
        ...prevImages,
        [courseId]: imageUrl,
      }));
    } catch (err) {
      console.error("Error fetching image:", err.response || err);
    }
  };

  const checkForChanges = async () => {
    try {
      const response = await instance.get("/course/getAllCourse", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newCourses = response.data.content;

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

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  Course Page
                </h1>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && <div className="text-center col-span-full">Loading...</div>}
                {error && <div className="text-center col-span-full text-red-500">{error}</div>}

                {courses.map((course) => (
                  <div key={course.courseId} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105">
                    <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
                      <h2 className="font-bold text-3xl text-gray-800 dark:text-gray-100">
                        {course.courseTitle}
                      </h2>
                    </header>

                    <div className="flex flex-col items-center p-4">
                      <div className="mb-6">
                        <img
                          src={courseImages[course.courseId] || joblkimg}
                          alt="Course"
                          className="w-72 h-80 object-cover rounded-lg"
                        />
                      </div>

                      <ul className="space-y-6 text-left w-full">
                        <li>
                          <span className="font-medium text-lg text-gray-800 dark:text-gray-100">
                            Course Description:
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {course.courseDescription}
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-lg text-gray-800 dark:text-gray-100">
                            Course Content:
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {course.courseContent}
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-lg text-gray-800 dark:text-gray-100">
                            Course Qualifications:
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {course.courseQualification}
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-lg text-gray-800 dark:text-gray-100">
                            Course Start Date:
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {course.courseStartDate}
                          </p>
                        </li>
                        <li>
                          <span className="font-medium text-lg text-gray-800 dark:text-gray-100">
                            Course Location:
                          </span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {course.courseLocation}
                          </p>
                        </li>
                      </ul>

                      <div className="mt-6 flex flex-col items-center space-y-4 w-full">
                        <label htmlFor="file-upload" className="text-sm font-medium text-gray-800 dark:text-gray-100">
                          Upload Your CV:
                        </label>
                        <div className="flex items-center space-x-4 w-full justify-center">
                          <input
                            id="file-upload"
                            type="file"
                            accept=".pdf, .docx, .txt"
                            className="hidden"
                            onChange={handleFileChange}
                            aria-labelledby="file-upload"
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById("file-upload").click()}
                            className="bg-blue-500 text-white py-3 px-12 rounded-md focus:outline-none text-lg"
                          >
                            Upload CV
                          </button>
                          {selectedFile && <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">{selectedFile}</span>}
                        </div>
                      </div>
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
