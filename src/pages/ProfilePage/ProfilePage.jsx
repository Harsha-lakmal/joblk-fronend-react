import React, { useRef, useState, useEffect } from "react";
import { Camera, File, Save } from "lucide-react";
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import UpdateUserCard from "../../comon/UpdateUserCard/UpdateUserCard";
import Swal from "sweetalert2";

const ProfilePage = () => {
  const [coverImage, setCoverImage] = useState("/default-cover.jpg");
  const [profileImage, setProfileImage] = useState("/default-profile.jpg");
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const profileInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("userData");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = parsedUser?.id;

  const showSuccessMessage = (msg = "Successful") => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: msg,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const showErrorMessage = (msg) => {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: msg || "Error",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCoverImage(imageUrl);
      uploadCoverImg(file);
    }
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      uploadProfileImage(file);
    }
  };

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
      uploadCv(file);
    }
  };

  const generateRandomFileName = () => {
    return `file_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;
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
      setError("Failed to load cover image.");
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

      if (!response || !response.data) {
        throw new Error("No profile image found");
      }

      const imageUrl = URL.createObjectURL(response.data);
      setProfileImage(imageUrl);

      if (parsedUser) {
        const updatedUser = { ...parsedUser, profileImage: imageUrl };
        localStorage.setItem("userData", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Error fetching user profile image:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId && token) {
      getCoverImage();
      getProfileImage();
    }
  }, [userId, token]);

  useEffect(() => {
    return () => {
      if (coverImage && coverImage.startsWith("blob:")) {
        URL.revokeObjectURL(coverImage);
      }
      if (profileImage && profileImage.startsWith("blob:")) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [coverImage, profileImage]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative flex justify-center mb-8">
        {loading && !profileImage ? (
          <div className="w-64 h-64 flex items-center justify-center bg-gray-200 rounded-full">
            Loading...
          </div>
        ) : (
          <div className="relative">
            <img
              src={profileImage}
              alt="Profile"
              className="w-64 h-64 object-cover rounded-full border-4 border-white shadow-lg"
            />
            <button
              type="button"
              onClick={() => profileInputRef.current.click()}
              className="absolute bottom-3 right-3 cursor-pointer p-2 rounded-full shadow-md bg-white hover:bg-gray-200"
            >
              <Camera size={20} color="blue" />
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

      <div className="relative mb-8">
        {loading && !coverImage ? (
          <div className="w-full h-64 flex items-center justify-center bg-gray-200 rounded-lg">
            Loading...
          </div>
        ) : (
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-64 object-cover rounded-lg shadow-md border-4 border-white shadow-lg"
          />
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="absolute bottom-3 right-3 cursor-pointer p-2 rounded-full shadow-md bg-white hover:bg-gray-200"
        >
          <Camera size={20} color="blue" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleCoverImageUpload}
        />
      </div>

      <div style={{position : "relative" ,  left : 390}}>

        <div className="mb-8">

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => cvInputRef.current?.click()}
              className="rounded-lg shadow-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-200 flex items-center gap-1.5 px-3 py-1.5 text-sm"
              disabled={loading || uploading}
            >
              <File size={16} className="text-white" />
              {cvFile ? "Change CV" : "Upload CV"}
            </button>

            {cvFile && (
              <div className="flex items-center gap-2 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 text-sm">
                <span className="text-green-800 font-medium">
                  Saved: <span className="text-gray-600">{cvFile.name}</span>
                </span>
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

      </div>

      <div
        className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 flex flex-col transition-all duration-300 ease-in-out mx-auto"
        style={{ maxWidth: 500 }}
      >
        <h1 className="font-bold text-xl text-left text-gray-700 dark:text-white mb-4">
          Your Details
        </h1>

        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <span className="font-bold text-lg text-[#6495ED]">Name:</span>
            <span className="ml-4">{parsedUser?.username || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-lg text-[#6495ED]">Email:</span>
            <span className="ml-4">{parsedUser?.email || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-lg text-[#6495ED]">Role:</span>
            <span className="ml-4">{parsedUser?.role || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-lg text-[#6495ED]">Password:</span>
            <span className="ml-4">••••••••</span>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <UpdateUserCard />
      </div>



      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      {(loading || uploading) && (
        <p className="text-blue-500 mt-4 text-center">Processing...</p>
      )}
    </div>
  );
};

export default ProfilePage;