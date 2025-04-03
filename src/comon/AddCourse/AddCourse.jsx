import { useState } from "react";
import './styles.css';  
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import Swal from 'sweetalert2';

function AddCourse() {
  const date = new Date();
  const formattedDate = date.toLocaleDateString("si-LK"); 
  const [show, setShow] = useState(false);
  const [courseTitle, SetCourseTitle] = useState("");
  const [courseDescription, SetCourseDescription] = useState("");
  const [courseLocation, SetCourseLocation] = useState("");
  const [courseQualification, SetCourseQualification] = useState("");
  const [courseContent, SetCourseContent] = useState("");
  const [courseStartDate, SetCourseStartDate] = useState("");
  const [imgPath, SetImgPath] = useState(null);

  const token = localStorage.getItem('authToken');
  const userData = JSON.parse(localStorage.getItem("userData"));
  const userId = userData?.id;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

function successMessage() {
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: " Successful",
        showConfirmButton: false,
        timer: 2000,
    });
}

function errorMessage(msg) {
    Swal.fire({
        position: "top-end",
        icon: "error",
        title: msg || " Unsuccessful",
        showConfirmButton: false,
        timer: 2000,
    });
}

  function clear(){
    SetCourseTitle('');
    SetCourseDescription('');
    SetCourseLocation('');
    SetCourseQualification('');
    SetCourseContent('');
    SetCourseStartDate('');
    SetImgPath(null);
  }

  const handleSave = async () => {
    if (!courseTitle || !courseDescription || !courseLocation || !courseQualification || !courseContent || !courseStartDate) {
      errorMessage("All fields must be filled!");
      return;
    }

    if (!token) {
      errorMessage('You are not logged in.');
      return;
    }

    const formData = new FormData();
    formData.append("courseTitle", courseTitle);
    formData.append("courseDescription", courseDescription);
    formData.append("courseLocation", courseLocation);
    formData.append("courseQualification", courseQualification);
    formData.append("courseContent", courseContent);
    formData.append("courseStartDate", courseStartDate);
    formData.append("dateUpload", formattedDate);


    try {
      const response = await instance.post(`course/addCourse/${userId}`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      successMessage();

      clear();
      if (imgPath) {
        uploadImg(response.data.courseId);
      }

      handleClose();
    } catch (error) {
      console.error('Error adding course:', error);
      errorMessage();
    }
  };

  const uploadImg = async (courseId) => {
    console.log(token);
    
    if (!imgPath) {
      console.error('No image file selected.');
      return;
    }

    const formDataImg = new FormData();
    formDataImg.append('file', imgPath); 

    try {
      const response = await instance.post(`/course/upload/${courseId}`, formDataImg, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      clear();
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response) {
          errorMessage();
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      SetImgPath(file);
      console.log("File selected:", file); 
    }
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
              <input type="text" placeholder="Course Title" value={courseTitle} onChange={(e) => SetCourseTitle(e.target.value)} />
              <input type="text" placeholder="Course Description" value={courseDescription} onChange={(e) => SetCourseDescription(e.target.value)} />
              <input type="text" placeholder="Course Location" value={courseLocation} onChange={(e) => SetCourseLocation(e.target.value)} />
              <input type="text" placeholder="Course Qualification" value={courseQualification} onChange={(e) => SetCourseQualification(e.target.value)} />
              <input type="text" placeholder="Course Content" value={courseContent} onChange={(e) => SetCourseContent(e.target.value)} />
              <input type="date" placeholder="Course Start Date" value={courseStartDate} onChange={(e) => SetCourseStartDate(e.target.value)} />

              <div className="file-upload">
                <label className="upload-label" htmlFor="file-upload">Upload Image</label>
                <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="clear-btn" onClick={() => {
                clear()

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
