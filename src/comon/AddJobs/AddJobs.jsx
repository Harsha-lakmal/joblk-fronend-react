import { useState } from "react";
import './styles.css';
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import Swal from 'sweetalert2';

function AddJobs() {
  const date = new Date();
  const formattedDate = date.toLocaleDateString("si-LK"); 
  const [show, setShow] = useState(false);
  const [jobTitle, SetJobTitle] = useState("");
  const [jobDescription, SetJobDescription] = useState("");
  const [qualifications, SetQualifications] = useState("");
  const [jobClosingDate, SetjobClosingDate] = useState("");
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



  function clear() {
    SetJobTitle('');
    SetJobDescription('');
    SetQualifications('');
    SetjobClosingDate('');
    SetImgPath(null);
  }

  const handleSave = async () => {
    if (!jobTitle || !jobDescription || !qualifications || !jobClosingDate || !imgPath) {
      errorMessage();
      return;
    }

    if (!token) {

      errorMessage();
      return;
    }

    const formData = new FormData();
    formData.append("jobTitle", jobTitle);
    formData.append("jobDescription", jobDescription);
    formData.append("qualifications", qualifications);
    formData.append("jobClosingDate", jobClosingDate);
    formData.append("dateUpload", formattedDate);


    try {
      const response = await instance.post(`job/addJob/${userId}`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log(response.data);
      
      successMessage();
      clear();
      if (imgPath) {
        uploadImg(response.data.jobId);
      }

      handleClose();
    } catch (error) {
      console.error('Error adding job:', error);
      errorMessage();
    }
  };

  const uploadImg = async (jobId) => {

    if (!imgPath) {
      console.error('No image file selected.');
      return;
    }

    const formDataImg = new FormData();
    formDataImg.append('file', imgPath);

    try {
      const response = await instance.post(`/job/upload/${jobId}`, formDataImg, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      clear();
      
    } catch (error) {
      console.error('Error uploading image:', error);
      if (error.response) {
        console.error('Server Response:', error.response.data);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      SetImgPath(file);
    }
  };

  return (
    <div className="container">
      <button className="open-modal-btn" onClick={handleShow}>Add Job</button>
      {show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Job</h2>
              <button className="close-btn" onClick={handleClose}>&times;</button>
            </div>
            <div className="modal-body">
              <input type="text" placeholder="Job Title" value={jobTitle} onChange={(e) => SetJobTitle(e.target.value)} />
              <input type="text" placeholder="Job Description" value={jobDescription} onChange={(e) => SetJobDescription(e.target.value)} />
              <input type="text" placeholder="Job Qualification" value={qualifications} onChange={(e) => SetQualifications(e.target.value)} />
              <input type="date" placeholder="Job Closing Date" value={jobClosingDate} onChange={(e) => SetjobClosingDate(e.target.value)} />

              <div className="file-upload">
                <label className="upload-label" htmlFor="file-upload">Upload Image</label>
                <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <div className="modal-footer">
              <button className="clear-btn" onClick={clear}>Clear</button>
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="close-btn" onClick={handleClose}>Close</button>
              
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default AddJobs;
