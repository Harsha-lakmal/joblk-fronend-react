import React, { useRef, useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx"; 
import UpdateUserCard from "../../comon/UpdateUserCard/UpdateUserCard";// Ensure the path is correct

const ProfilePage = () => {
  const [coverImage, setCoverImage] = useState("/default-cover.jpg");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Get user data from localStorage
  const token = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("userData");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = parsedUser?.id;

  // Function to handle cover image upload
  const handleCoverImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setCoverImage(imageUrl);
      uploadCoverImg(file); // Automatically upload after selection
    }
  };

  // Open file picker dialog
  const handleOpenFilePicker = () => {
    fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  // Upload cover image to server
  const uploadCoverImg = async (file) => {
    if (!userId || !file) {
      console.error("User ID or file is missing!");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await instance.post(`/user/uploadCover/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload successful", response.data);
      getCoverImage(); // Refresh cover image after upload
    } catch (err) {
      setError("Failed to upload image.");
      console.error("Error uploading image:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cover image from server
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
      console.error("Error fetching image:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cover image on component mount
  useEffect(() => {
    if (userId && token) {
      getCoverImage();
    }
  }, [userId, token]);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (coverImage) {
        URL.revokeObjectURL(coverImage);
      }
    };
  }, [coverImage]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover Image */}
      <div className="relative">
        {loading ? (
          <div className="w-full h-64 flex items-center justify-center bg-gray-200">Loading...</div>
        ) : (
          <img src={coverImage} alt="Cover" className="w-full h-64 object-cover rounded-lg" />
        )}

        {/* Upload Button */}
        <button
          type="button"
          onClick={handleOpenFilePicker}
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

    <div style={{position:"relative" , top : "100px"}}>
      <UpdateUserCard />
    </div>

      {/* Error Message */}
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
    </div>
  );
};

export default ProfilePage;
