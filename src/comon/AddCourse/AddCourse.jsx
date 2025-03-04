import { useState } from "react";
import './stlyes.css'

function AddCourse() {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    courseTitle: "", courseDescription: "", courseLocation: "",
    courseQualification: "", courseContent: "", courseStartDate: "", imgPath: null
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleClear = () => setFormData({
    courseTitle: "", courseDescription: "", courseLocation: "",
    courseQualification: "", courseContent: "", courseStartDate: "", imgPath: null
  });
  const handleFileChange = (e) => setFormData({ ...formData, imgPath: e.target.files[0] });

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
              {Object.keys(formData).map((key) => (
                key !== "imgPath" ? (
                  <input key={key} type="text" name={key} placeholder={key.replace(/([A-Z])/g, ' $1')} value={formData[key]} onChange={handleChange} />
                ) : (
                  <div key={key} className="file-upload">
                    <label className="upload-label" htmlFor="file-upload">Upload Imge </label>
                    <input id="file-upload" type="file" name={key} onChange={handleFileChange} />
                  </div>
                )
              ))}
            </div>
            <div className="modal-footer">
              <button className="clear-btn" onClick={handleClear}>Clear</button>
              <button className="save-btn" onClick={() => { console.log(formData); handleClose(); }}>Save</button>
              <button className="close-btn" onClick={handleClose}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddCourse;

