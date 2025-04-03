import React, { useRef, useState, useEffect } from "react";
import { Camera, UserCog, Save, Lock, Eye, EyeOff } from "lucide-react";
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [coverImage, setCoverImage] = useState("/default-cover.jpg");
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fileInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [passwordError, setPasswordError] = useState("");

  const token = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("userData");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = parsedUser?.id;
  const isAdmin = parsedUser?.role === "Admin";

  useEffect(() => {
    if (parsedUser) {
      setUsername(parsedUser.username || "");
      setEmail(parsedUser.email || "");
      setRole(parsedUser.role || "Employee");
    }
  }, [parsedUser]);

  const showSuccessMessage = (msg = "Successful") => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: msg,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const showErrorMessage = (msg = "Error occurred") => {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: msg,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showErrorMessage("Please upload an image file");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setCoverImage(imageUrl);
      uploadCoverImg(file);
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showErrorMessage("Please upload an image file");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      uploadProfileImage(file);
    }
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (!validTypes.includes(file.type)) {
        showErrorMessage("Please upload a PDF or Word document");
        return;
      }
      setCvFile(file);
      uploadCv(file);
    }
  };

  const uploadProfileImage = async (file) => {
    if (!userId || !file) {
      showErrorMessage("User ID or file is missing!");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await instance.put(`/user/update/imageProfile/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccessMessage("Profile image updated successfully!");
      getProfileImage();

      if (parsedUser) {
        const updatedUser = { ...parsedUser, profileImage: response.data.imageUrl };
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Error uploading profile image:", err);
      showErrorMessage("Error updating profile image.");
    } finally {
      setUploading(false);
    }
  };

  const uploadCoverImg = async (file) => {
    if (!userId || !file) {
      showErrorMessage("User ID or file is missing!");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await instance.post(`/user/uploadCover/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccessMessage("Cover image uploaded successfully");
      getCoverImage();
    } catch (err) {
      showErrorMessage("Error uploading cover image");
    } finally {
      setLoading(false);
    }
  };

  const uploadCv = async (file) => {
    if (!userId || !file) {
      showErrorMessage("User ID or CV file is missing!");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await instance.post(`/user/uploadCvDocument/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showSuccessMessage("CV uploaded successfully!");
    } catch (err) {
      showErrorMessage("Error uploading CV");
    } finally {
      setLoading(false);
    }
  };

  const getCoverImage = async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      const response = await instance.get(`/user/get/imageCover/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setCoverImage(imageUrl);
    } catch (err) {
      setCoverImage("/default-cover.jpg");
    } finally {
      setLoading(false);
    }
  };

  const getProfileImage = async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      const response = await instance.get(`/user/get/imageProfile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      if (response.data.size > 0) {
        const imageUrl = URL.createObjectURL(response.data);
        setProfileImage(imageUrl);

        if (parsedUser) {
          const updatedUser = { ...parsedUser, profileImage: imageUrl };
          localStorage.setItem("userData", JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      setProfileImage("/default-profile.jpg");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && token) {
      getCoverImage();
      getProfileImage();
    }

    return () => {
      [coverImage, profileImage].forEach(image => {
        if (image && image.startsWith("blob:")) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [userId, token]);

  const handleCloseModal = () => {
    setShowModal(false);
    setPasswordError("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleShowModal = () => setShowModal(true);

  const handleClear = () => {
    if (parsedUser) {
      setUsername(parsedUser.username || "");
      setEmail(parsedUser.email || "");
      setPassword("");
      setConfirmPassword("");
      setRole(parsedUser.role || "Employee");
    }
    setPasswordError("");
  };

  const validatePassword = () => {
    if (password && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const updateUser = async () => {
    if (!username || !email) {
      showErrorMessage("Username and email are required");
      return;
    }

    if (password && !validatePassword()) {
      return;
    }

    try {
      const userData = {
        id: userId,
        username,
        email,
        role,
        ...(password && { password }), 
      };

      const response = await instance.put(`/user/updateUser`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showSuccessMessage("Profile updated successfully!");
      navigate("/login")


      handleCloseModal();
    } catch (error) {
      console.error("Error updating user:", error);
      showErrorMessage("Failed to update user");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 relative">
      <div className="mb-24 relative">
        {loading && !coverImage ? (
          <div className="w-full h-72 flex items-center justify-center bg-gray-100 rounded-xl">
            <div className="text-blue-500">Loading...</div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-72 object-cover rounded-xl shadow-md"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <Camera size={20} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleCoverImageUpload}
            />
          </div>
        )}
      </div>

      <div className="absolute top-48 left-1/2 transform -translate-x-1/2 z-10">
        {loading && !profileImage ? (
          <div className="w-44 h-44 flex items-center justify-center bg-gray-100 rounded-full border-4 border-white">
            <div className="text-blue-500">Loading...</div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={profileImage}
              alt="Profile"
              className="w-44 h-44 object-cover rounded-full border-4 border-white shadow-md"
            />
            <button
              type="button"
              onClick={() => profileInputRef.current.click()}
              className="absolute bottom-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              <Camera size={16} />
            </button>
            <input
              ref={profileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleProfileImageUpload}
            />
          </div>
        )}
      </div>

      <div className="flex justify-center mt-10 mb-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => cvInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={loading || uploading}
          >
            <Save size={16} />
            {cvFile ? "Change CV" : "Upload CV"}
          </button>

          {cvFile && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <span className="font-medium text-green-700">Saved:</span>
              <span className="text-gray-600">{cvFile.name}</span>
            </div>
          )}
        </div>

        <input
          ref={cvInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleCvUpload}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 flex flex-col transition-all duration-300 ease-in-out mx-auto max-w-md">
        <h1 className="font-bold text-xl text-left text-gray-700 dark:text-white mb-4">
          Your Details
        </h1>

        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-blue-400">Name:</span>
            <span className="ml-4 dark:text-white">{parsedUser?.username || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-blue-400">Email:</span>
            <span className="ml-4 dark:text-white">{parsedUser?.email || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-blue-400">Role:</span>
            <span className="ml-4 dark:text-white">{parsedUser?.role || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg text-blue-400">Password:</span>
            <span className="ml-4 dark:text-white">••••••••</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button 
          className="flex items-center gap-2 px-5 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors hover:-translate-y-1 hover:shadow-lg" 
          onClick={handleShowModal}
        >
          <UserCog size={20} />
          Update Your Details
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">Update Profile</h2>
              <button 
                className="text-2xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white" 
                onClick={handleCloseModal}
              >
                &times;
              </button>
            </div>
            
            <div className="px-5 py-4">
              <div className="mb-4">
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {password && (
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-500">{passwordError}</p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                {isAdmin ? (
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-no-repeat bg-right pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundSize: '1rem'
                    }}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Trainer">Trainer</option>
                    <option value="Admin">Admin</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    id="role"
                    value={role}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                  />
                )}
              </div>
            </div>

            <div className="px-5 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                onClick={handleClear}
              >
                Reset
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                onClick={updateUser}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-center text-red-500">{error}</div>
      )}
      
      {(loading || uploading) && (
        <div className="mt-4 text-center text-blue-500">Processing...</div>
      )}
    </div>
  );
};

export default ProfilePage;