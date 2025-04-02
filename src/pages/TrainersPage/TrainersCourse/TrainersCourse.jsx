import Header from '../../../partials/Header';
import Banner from '../../../comon/Banner/Banner';
import TrainersSidebar from '../../../partials/TrainersSidebar';
import AddCourse from '../../../comon/AddCourse/AddCourse';
import React, { useState, useEffect } from 'react';
import joblkimg from '../../../Assets/joblk.png';
import { instance } from "../../../Service/AxiosHolder/AxiosHolder";

function TrainersCourse() {
  const [courses, setCourses] = useState([]);
  const [courseImages, setCourseImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No authentication token found.');
      setLoading(false);
      return;
    }
  
    getData();
    
    const interval = setInterval(() => {
      checkForChanges();
    }, 4000);
  
    return () => clearInterval(interval);
  }, [token]);

  const getData = () => {
    setLoading(true);
    instance.get('/course/getAllCourse', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setCourses(response.data.content);
      setLoading(false);

      response.data.content.forEach(course => {
        getCourseImage(course.courseId);
      });
    })
    .catch(error => {
      setError("Failed to load courses.");
      setLoading(false);
    });
  };

  const getCourseImage = (courseId) => {
    instance.get(`course/get/image/${courseId}`, {
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
      console.error('Error fetching image:', err);
    });
  };

  const handleCourseAdded = (newCourse) => {
    setCourses(prev => [...prev, newCourse]);
    
    getCourseImage(newCourse.courseId);
  };

  const checkForChanges = () => {
    instance
      .get('/course/getAllCourse', { 
        headers: { 
          'Authorization': `Bearer ${token}` 
        } 
      })
      .then((response) => {
        const newCourses = response.data.content;
        
        const currentIds = courses.map(course => course.courseId).sort().join(',');
        const newIds = newCourses.map(course => course.courseId).sort().join(',');
        
        if (currentIds !== newIds || courses.length !== newCourses.length) {
          console.log('Changes detected, updating course list...');
          setCourses(newCourses);
          
          newCourses.forEach((course) => {
            if (!courseImages[course.courseId]) {
              getCourseImage(course.courseId);
            }
          });
        }
      })
      .catch((error) => console.error('Error checking for updates:', error));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <TrainersSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{color :"#6495ED"}}> Course opportunity </h1>
              </div>
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <AddCourse onJobAdded={handleCourseAdded} />
              </div>
            </div>

            <div>
              {loading && <div className="text-center col-span-full">Loading...</div>}
              {error && <div className="text-center col-span-full text-red-500">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => (
                  <div key={course.courseId} className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105">
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