import { useState } from "react";
import './styles.css';  // Make sure you have this file
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx"; // Adjust the import path if necessary
import { Upload } from "lucide-react";

function AddCourse() {
  const [show, setShow] = useState(false);
  const [courseTitle, SetCourseTittle] = useState("");
  const [courseDescription, SetCourseDescription] = useState("");
  const [courseLocation, SetCourseLocation] = useState("");
  const [courseQualification, SetCourseQualification] = useState("");
  const [courseContent, SetCourseContent] = useState("");
  const [courseStartDate, SetCourseStartDate] = useState("");
  const [imgPath, SetImgPath] = useState(null);  // Add imgPath state

  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.id;

  if (!userId) {
    console.error("User not found. Please log in.");
    return;
  }

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Handle form submission and API call
  const handleSave = async () => {
    // Basic form validation
    if (!courseTitle || !courseDescription || !courseLocation || !courseQualification || !courseContent || !courseStartDate) {
      alert("All fields must be filled!");
      return;
    }

    const formData = new FormData();
    formData.append("courseTitle", courseTitle);
    formData.append("courseDescription", courseDescription);
    formData.append("courseLocation", courseLocation);
    formData.append("courseQualification", courseQualification);
    formData.append("courseContent", courseContent);
    formData.append("courseStartDate", courseStartDate);

    if (!token) {
      alert('You are not logged in.');
      return;
    }

    try {
      // Submit the course data
      const response = await instance.post(`course/addCourse/${userId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log(response.data);
      alert('Course added successfully!');

      // Now, handle the image upload
      // if (imgPath) {
      //   uploadImg(response.data.content.courseId);
      // }

      handleClose();
    } catch (error) {
      console.error('Error adding course:', error);
      if (error.response) {
        console.error('Error details:', error.response.data);
        console.error('Status:', error.response.status);
      }
      alert('There was an error while adding the course. Please try again!');
    }
  };

  // Upload image to the backend
  function uploadImg(courseId) {
    if (!imgPath) {
      console.error('No image file selected.');
      return;
    }

    const formDataImg = new FormData();
    formDataImg.append("img", imgPath);  // Add the image to the form data

    instance.post(`/course/upload/${courseId}`, formDataImg, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'multipart/form-data'      
      }
    })
    .then(response => {
      console.log('Image uploaded successfully', response);
    })
    .catch(error => {
      console.error('Error uploading image:', error);
    });
  }

  const handleFileChange = (e) => {
    SetImgPath(e.target.files[0]);  // Set the selected file to imgPath
  };

  return (
    <div className="container">
      <button className="open-modal-btn" onClick={handleShow}>Add Course</button>
      {show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Course</h2>
              <button className="close-btn" onClick={handleClose}>&times;</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                name="courseTitle"
                placeholder="Course Title"
                value={courseTitle}
                onChange={(e) => SetCourseTittle(e.target.value)}
              />
              <input
                type="text"
                name="courseDescription"
                placeholder="Course Description"
                value={courseDescription}
                onChange={(e) => SetCourseDescription(e.target.value)}
              />
              <input
                type="text"
                name="courseLocation"
                placeholder="Course Location"
                value={courseLocation}
                onChange={(e) => SetCourseLocation(e.target.value)}
              />
              <input
                type="text"
                name="courseQualification"
                placeholder="Course Qualification"
                value={courseQualification}
                onChange={(e) => SetCourseQualification(e.target.value)}
              />
              <input
                type="text"
                name="courseContent"
                placeholder="Course Content"
                value={courseContent}
                onChange={(e) => SetCourseContent(e.target.value)}
              />
              <input
                type="date"
                name="courseStartDate"
                placeholder="Course Start Date"
                value={courseStartDate}
                onChange={(e) => SetCourseStartDate(e.target.value)}
              />
              <div className="file-upload">
                <label className="upload-label" htmlFor="file-upload">Upload Image</label>
                <input 
                  id="file-upload" 
                  type="file" 
                  name="imgPath" 
                  onChange={handleFileChange}  // Handle file selection
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="clear-btn" onClick={() => {
                SetCourseTittle('');
                SetCourseDescription('');
                SetCourseLocation('');
                SetCourseQualification('');
                SetCourseContent('');
                SetCourseStartDate('');
                SetImgPath(null);  // Reset imgPath when clearing
              }}>Clear</button>
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="close-btn" onClick={handleClose}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddCourse;
