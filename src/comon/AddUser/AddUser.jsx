import { useState } from "react";
import './styles.css';

function AddUser() {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    username: "", password: "", email: "", role: "",
    imgPathProfile: null, imgPathCover: null
  });
  const [fileNames, setFileNames] = useState({
    imgPathProfile: "",
    imgPathCover: ""
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleClear = () => setFormData({
    username: "", password: "", email: "", role: "",
    imgPathProfile: null, imgPathCover: null
  });

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({ ...formData, [name]: files[0] });
    setFileNames({ ...fileNames, [name]: files[0].name }); // Store the file name
  };

  return (
    <div className="container">
      <button className="open-modal-btn" onClick={handleShow}>Add User</button>
      {show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add User</h2>
              <button className="close-btn" onClick={handleClose}>&times;</button>
            </div>
            <div className="modal-body">
              {Object.keys(formData).map((key) => (
                key !== "imgPathProfile" && key !== "imgPathCover" ? (
                  key === "role" ? (
                    <div key={key} className="form-group">
                      <label htmlFor={key}>Role</label>
                      <select
                        name={key}
                        value={formData[key]}
                        onChange={handleChange}
                        className="role-dropdown"
                      >
                        {!formData[key] && <option value="">Select Role</option>} {/* Show only if no value selected */}
                        <option value="Admin">Admin</option>
                        <option value="Employee">Employee</option>
                        <option value="Trainer">Trainer</option>
                        <option value="Employees">Employees</option>
                      </select>
                    </div>
                  ) : (
                    <input
                      key={key}
                      type={key === "password" ? "password" : "text"}
                      name={key}
                      placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      value={formData[key]}
                      onChange={handleChange}
                    />
                  )
                ) : (
                  <div key={key} className="file-upload">
                    <label className="upload-label" htmlFor={key}>
                      {key === "imgPathProfile" ? "Profile Image" : "Cover Image"}
                    </label>
                    <input
                      id={key}
                      type="file"
                      name={key}
                      onChange={handleFileChange}
                    />
                    {fileNames[key] && <span className="file-name">{fileNames[key]}</span>} {/* Display the file name */}
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

export default AddUser;
