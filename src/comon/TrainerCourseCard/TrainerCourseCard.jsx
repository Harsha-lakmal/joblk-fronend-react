import React, { useState, useEffect } from 'react';
import joblkimg from '../../Assets/joblk.png';
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx"; 

function TrainerCourseCard() {
  const [courses, setCourses] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseImages, setCourseImages] = useState({});
  const token = localStorage.getItem('authToken');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file.name); 
    }
  };

  useEffect(() => {
    getData(); 
  }, []); 

  function getData() {
    instance.get('/course/getAllCourse', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      setCourses(response.data.content);
      setLoading(false);

      response.data.content.forEach(course => {
        getimg(course.courseId); 
      });
    })
    .catch(error => {
      setError("Failed to load courses.");
      setLoading(false);
    });
  }

  const getimg = (courseId) => {
    console.log('Fetching image for course ID:', courseId); 
    instance.get(`course/get/image/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${token}` 
      },
      responseType: 'blob'
    })
    .then((res) => {
      const imageUrl = URL.createObjectURL(res.data);

      setCourseImages(prevImages => ({
        ...prevImages,
        [courseId]: imageUrl 
      }));
    })
    .catch((err) => {
      console.error('Error fetching image:', err.response || err); 
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {loading && <div className="text-center col-span-full">Loading...</div>}
      {error && <div className="text-center col-span-full text-red-500">{error}</div>}
      
      {courses.map((course) => (
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
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 36 36">
                    <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-lg text-gray-800 dark:text-gray-100">Course Description:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.courseDescription}</p>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 36 36">
                    <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-lg text-gray-800 dark:text-gray-100">Course Content:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.courseContent}</p>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 36 36">
                    <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-lg text-gray-800 dark:text-gray-100">Course Qualifications:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.courseQualification}</p>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 36 36">
                    <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-lg text-gray-800 dark:text-gray-100">Course Start Date:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.courseStartDate}</p>
                </div>
              </li>

              <li className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 36 36">
                    <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-medium text-lg text-gray-800 dark:text-gray-100">Course Location:</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{course.courseLocation}</p>
                </div>
              </li>
            </ul>

           <br />
          </div>
        </div>
      ))}
    </div>
  );
}

export default TrainerCourseCard;
