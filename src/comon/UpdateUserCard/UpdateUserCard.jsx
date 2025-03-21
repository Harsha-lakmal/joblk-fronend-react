import { useState } from "react";
import "./styles.css";
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import Swal from "sweetalert2";

function UpdateUserCard() {
  const [show, setShow] = useState(false);
  const [fileNames, setFileNames] = useState({
    imgPathProfile: "",
    imgPathCover: ""
  });
  const [username, SetUsername] = useState("");
  const [email, SetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, SetRole] = useState("");


  function showSuccessMessage() {
    Swal.fire({
        position: "top-end",
        icon: "success",
        title: " Successful",
        showConfirmButton: false,
        timer: 2000,
    });
}

function showErrorMessage(message) {
    Swal.fire({
        position: "top-end",
        icon: "error",
        title: message,
        showConfirmButton: false,
        timer: 2000,
    });
}

  const storedUser = localStorage.getItem("userData");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = parsedUser?.id;
  const token = localStorage.getItem("authToken");

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleClear = () => {
    SetUsername("");
    SetEmail("");
    setPassword("");
    SetRole("");
  };

  const addUser = async () => {
    try {
      const userData = {
        id: userId,
        username: username,
        password: password,
        email: email,
        role: role
      };

      const userResponse = await instance.put(`/user/updateUser`, userData, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      showSuccessMessage();

      handleClear();
      handleClose();
    } catch (error) {
      console.error("Error updating user:", error);
      showErrorMessage();
    }
  };

  return (
    <div className="container">
      <button className="open-modal-btn" onClick={handleShow}>Update Your Account</button>
      {show && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update User</h2>
              <button className="close-btn" onClick={handleClose}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => SetUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => SetEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  name="role"
                  value={role}
                  onChange={(e) => SetRole(e.target.value)}
                  className="role-dropdown"
                >
                  <option value="">Select Role</option>
                  <option value="Admin">Employees</option>
                  <option value="Employee">Employee</option>
                  <option value="Trainer">Trainer</option>
                </select>
              </div>
            </div>
            <br /> <br />

            <div className="modal-footer">
              <button className="clear-btn" onClick={handleClear}>Clear</button>
              <button className="save-btn" onClick={addUser}>Save</button>
              <button className="close-btn" onClick={handleClose}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateUserCard;
