import React, { useState } from 'react';
import joblkimg from '../../Assets/joblk.png';

function CourseCard() {
  const [selectedFile, setSelectedFile] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file.name); // Set the selected file's name
    }
  };

  return (
    <div className="col-span-full xl:col-span-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-5">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 text-2xl">Software Engineer Course</h2>
      </header>

      <div className="p-4">
        {/* Course Image */}
        <div className="mb-4">
          <img 
            src={joblkimg} 
            alt="Course Image"
            // className="w-full h-auto rounded-xl shadow-md"
            width={'200px'}
            height={'200px'}
            style={{position:"relative" , left:'80px'}} // Styling the image
          />
        </div>

        {/* Course Details */}
        <ul className="space-y-4">
          {/* Course Description */}
          <li className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 36 36">
                <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-medium text-gray-800 dark:text-gray-100">Course Description:</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                As a Software Engineer, you will design, develop, and maintain software applications and systems. You will
                collaborate with cross-functional teams to understand requirements, implement solutions, and ensure high-quality code is delivered on time.
              </p>
            </div>
          </li>

          {/* Course Content */}
          <li className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 36 36">
                <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-medium text-gray-800 dark:text-gray-100">Course Content:</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                In this course, you will dive into the fundamentals of software engineering, including algorithms, data structures, system design, and software development methodologies.
              </p>
            </div>
          </li>

          {/* Course Qualifications */}
          <li className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 36 36">
                <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-medium text-gray-800 dark:text-gray-100">Course Qualifications:</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Proficiency in programming languages such as Java, Python, C++, JavaScript, or others.
              </p>
            </div>
          </li>

          {/* Course Start Date */}
          <li className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 36 36">
                <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-medium text-gray-800 dark:text-gray-100">Course Start Date:</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">02/12/2028</p>
            </div>
          </li>

          {/* Course Location */}
          <li className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 36 36">
                <path d="M17.7 24.7l1.4-1.4-4.3-4.3H25v-2H14.8l4.3-4.3-1.4-1.4L11 18z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-medium text-gray-800 dark:text-gray-100">Course Location:</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">Panadura</p>
            </div>
          </li>
        </ul>

        {/* File Upload Section */}
        <div className="mt-6 flex flex-col items-center space-y-4">
          <label htmlFor="file-upload" className="text-sm font-medium text-gray-800 dark:text-gray-100">
            Upload Your CV:
          </label>
          <div className="flex items-center space-x-4">
            <input
              id="file-upload"
              type="file"
              accept=".pdf, .docx, .txt"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => document.getElementById('file-upload').click()}
              className="bg-blue-500 text-white py-2 px-10 rounded-md"
            >
              Upload CV
            </button>
            {selectedFile && (
              <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">{selectedFile}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
