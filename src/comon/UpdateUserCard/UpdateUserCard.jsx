import { useState } from "react";
import "./styles.css";
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

function UpdateUserCard() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [username, setUsername] = useState("update");
  const [email, setEmail] = useState("update");
  const [password, setPassword] = useState("update");
  const [role, setRole] = useState("Employees");

  function showSuccessMessage() {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Successful",
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
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("");
  };

  const updateUser = async () => {
    try {
      const userData = {
        id: userId,
        username,
        password,
        email,
        role,
      };

      await instance.put(`/user/updateUser`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showSuccessMessage();
      navigate("/login");
      handleClear();
      handleClose();
    } catch (error) {
      console.error("Error updating user:", error);
      showErrorMessage("Failed to update user");
    }
  };

  return (
    <div className="container">
      <button className="open-modal-btn" onClick={handleShow}>
        Update Your Account
      </button>
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
                  onChange={(e) => setUsername(e.target.value)}
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
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="role-dropdown"
                >
                  <option value="">Select Role</option>
                  <option value="Employee">Employees</option>
                  <option value="Trainer">Trainer</option>
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="clear-btn" onClick={handleClear}>Clear</button>
              <button className="save-btn" onClick={updateUser}>Save</button>
              <button className="close-btn" onClick={handleClose}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateUserCard;
