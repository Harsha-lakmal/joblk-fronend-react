import { useState } from "react";
import './stlyes.css';

function AddJobs() {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "", jobDescription: "", jobLocation: "",
    jobQualification: "", jobStartDate: "", imgPath: null
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleClear = () => setFormData({
    jobTitle: "", jobDescription: "", jobLocation: "",
    jobQualification: "", jobStartDate: "", imgPath: null
  });
  const handleFileChange = (e) => setFormData({ ...formData, imgPath: e.target.files[0] });

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
              {Object.keys(formData).map((key) => (
                key !== "imgPath" ? (
                  <input key={key} type="text" name={key} placeholder={key.replace(/([A-Z])/g, ' $1').replace('job', 'Job')} value={formData[key]} onChange={handleChange} />
                ) : (
                  <div key={key} className="file-upload">
                    <label className="upload-label" htmlFor="file-upload">Upload Image</label>
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

export default AddJobs;
