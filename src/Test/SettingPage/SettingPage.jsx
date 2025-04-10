import React, { useRef, useState, useEffect } from "react";
import { 
  Camera, UserCog, Save, Lock, Eye, EyeOff, X, 
  LogOut, Moon, Sun, Trash2, Bell, BellOff, Users 
} from "lucide-react";
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const SettingPage = () => {
  const [coverImage, setCoverImage] = useState("/default-cover.jpg");
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [passwordError, setPasswordError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const fileInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const navigate = useNavigate();
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
    
    const savedMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedMode);
    document.documentElement.classList.toggle("dark", savedMode);
    
    const savedNotifications = localStorage.getItem("notificationsEnabled") !== "false";
    setNotificationsEnabled(savedNotifications);
  }, [parsedUser]);

  const showSuccessMessage = (msg = "Operation successful") => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: msg,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const showErrorMessage = (msg = "An error occurred") => {
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
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorMessage("Please upload an image file");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setCoverImage(imageUrl);
    uploadCoverImg(file);
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showErrorMessage("Please upload an image file");
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
    uploadProfileImage(file);
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
      showErrorMessage("Error updating profile image");
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

      await instance.put(`/user/updateUser`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      showSuccessMessage("Profile updated successfully!");
      navigate("/login");
      handleCloseModal();
    } catch (error) {
      console.error("Error updating user:", error);
      showErrorMessage("Failed to update user");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignOut = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, sign out!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        navigate("/login");
        showSuccessMessage("Signed out successfully");
      }
    });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    document.documentElement.classList.toggle("dark", newMode);
    showSuccessMessage(newMode ? "Dark mode enabled" : "Light mode enabled");
  };

  const handleDeleteAccount = () => {
    Swal.fire({
      title: "Delete your account?",
      text: "This action cannot be undone. All your data will be permanently removed!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await instance.delete(`/user/delete/user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          localStorage.removeItem("authToken");
          localStorage.removeItem("userData");
          navigate("/login");
          showSuccessMessage("Your account has been deleted");
        } catch (err) {
          showErrorMessage("Error deleting account");
        }
      }
    });
  };

  const toggleNotifications = () => {
    const newSetting = !notificationsEnabled;
    setNotificationsEnabled(newSetting);
    localStorage.setItem("notificationsEnabled", newSetting.toString());
    showSuccessMessage(
      newSetting ? "Notifications enabled" : "Notifications disabled"
    );
  };

  const handleSportsTeam = () => {
    Swal.fire({
      title: "Sports Team Support",
      html: `
        <div class="text-left">
          <p class="mb-4">Need help with your sports team management?</p>
          <ul class="list-disc pl-5 space-y-2">
            <li>Team scheduling</li>
            <li>Player management</li>
            <li>Game statistics</li>
            <li>Training programs</li>
          </ul>
          <p class="mt-4">Contact our support team for assistance.</p>
        </div>
      `,
      confirmButtonText: "Got it!",
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <div className="mb-32 relative">
        {loading && !coverImage ? (
          <div className="w-full h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
        ) : (
          <div className="relative group">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-80 object-cover rounded-xl shadow-lg transition-all duration-300"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-4 right-4 p-3 bg-white/90 rounded-full shadow-md hover:bg-white transition-all duration-300 group-hover:opacity-100 opacity-0"
              disabled={loading}
            >
              <Camera size={20} className="text-gray-700" />
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

      <div className="absolute top-64 left-1/2 transform -translate-x-1/2 z-10">
        {loading && !profileImage ? (
          <div className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
        ) : (
          <div className="relative group">
            <img
              src={profileImage}
              alt="Profile"
              className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-lg transition-all duration-300"
            />
            <button
              onClick={() => profileInputRef.current.click()}
              className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all duration-300 group-hover:opacity-100 opacity-0"
              disabled={uploading}
            >
              <Camera size={16} className="text-gray-700" />
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

      <div className="text-center mt-20 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {parsedUser?.username || "User"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          {parsedUser?.email || "No email provided"}
        </p>
        <span className="inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {parsedUser?.role || "No role"}
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 mx-auto max-w-md mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
          Account Details
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600 dark:text-gray-300">Username:</span>
            <span className="font-semibold text-gray-800 dark:text-white">{parsedUser?.username || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600 dark:text-gray-300">Email:</span>
            <span className="font-semibold text-gray-800 dark:text-white">{parsedUser?.email || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600 dark:text-gray-300">Role:</span>
            <span className="font-semibold text-gray-800 dark:text-white">{parsedUser?.role || "N/A"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600 dark:text-gray-300">Password:</span>
            <span className="font-semibold text-gray-800 dark:text-white">••••••••</span>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={handleShowModal}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300"
          >
            <UserCog size={20} />
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full">
              <LogOut className="text-red-600 dark:text-red-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Sign Out
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Sign out of your account on this device
          </p>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-300"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>

        {/* Dark Mode Toggle Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              {darkMode ? (
                <Sun className="text-blue-600 dark:text-blue-400" size={24} />
              ) : (
                <Moon className="text-blue-600 dark:text-blue-400" size={24} />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {darkMode ? "Light Mode" : "Dark Mode"}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Switch between light and dark theme
          </p>
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-300"
          >
            {darkMode ? (
              <>
                <Sun size={20} />
                Switch to Light
              </>
            ) : (
              <>
                <Moon size={20} />
                Switch to Dark
              </>
            )}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/50 rounded-full">
              <Trash2 className="text-rose-600 dark:text-rose-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Delete Account
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Permanently remove your account and all data
          </p>
          <button
            onClick={handleDeleteAccount}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-colors duration-300"
          >
            <Trash2 size={20} />
            Delete Account
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full">
              <Users className="text-green-600 dark:text-green-400" size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Sports Team Help 
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Get assistance with team management and training
          </p>
          <button
            onClick={handleSportsTeam}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-300"
          >
            <Users size={20} />
            Get Help
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
              {notificationsEnabled ? (
                <Bell className="text-purple-600 dark:text-purple-400" size={24} />
              ) : (
                <BellOff className="text-purple-600 dark:text-purple-400" size={24} />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              Notifications
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {notificationsEnabled
              ? "Notifications are currently enabled"
              : "Notifications are currently disabled"}
          </p>
          <button
            onClick={toggleNotifications}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors duration-300"
          >
            {notificationsEnabled ? (
              <>
                <BellOff size={20} />
                Disable Notifications
              </>
            ) : (
              <>
                <Bell size={20} />
                Enable Notifications
              </>
            )}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Edit Profile</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
                onClick={handleCloseModal}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                    placeholder="Leave blank to keep current"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {password && (
                <div>
                  <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="mt-2 text-sm text-red-500">{passwordError}</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role
                </label>
                {isAdmin ? (
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none bg-no-repeat bg-right pr-10"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.75rem center',
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
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                  />
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
                onClick={handleClear}
              >
                Reset
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                onClick={updateUser}
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {error}
        </div>
      )}
      
      {(loading || uploading) && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </div>
      )}
    </div>
  );
};

export default SettingPage;