import React, { useRef, useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { instance } from "/src/Service/AxiosHolder/AxiosHolder.jsx";
import UpdateUserCard from "../../comon/UpdateUserCard/UpdateUserCard";
import Swal from "sweetalert2";

const ProfilePage = () => {
  const [coverImage, setCoverImage] = useState("/default-cover.jpg");
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const token = localStorage.getItem("authToken");
  const storedUser = localStorage.getItem("userData");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = parsedUser?.id;

  const showSuccessMessage = () => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Successful",
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

  const handleCvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file);
      uploadCv(file);
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

      showSuccessMessage();
      getCoverImage();
    } catch (err) {
      showErrorMessage("Error uploading image");
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

      showSuccessMessage();
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

  useEffect(() => {
    if (userId && token) {
      getCoverImage();
    }
  }, [userId, token]);

  useEffect(() => {
    return () => {
      if (coverImage && coverImage.startsWith("blob:")) {
        URL.revokeObjectURL(coverImage);
      }
    };
  }, [coverImage]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative">
        {loading && !coverImage ? (
          <div className="w-full h-64 flex items-center justify-center bg-gray-200">
            Loading...
          </div>
        ) : (
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-64 object-cover rounded-lg"
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

      <div className="mt-5">
        <button
          type="button"
          onClick={() => cvInputRef.current.click()}
          className="cursor-pointer p-2 rounded-md shadow-md bg-blue-500 hover:bg-blue-400 text-white"
          disabled={loading}
        >
          uplaod for save cv 
                  </button>

        <input
          ref={cvInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleCvUpload}
        />
      </div>

      <div style={{ position: "relative", top: "100px" }}>
        <UpdateUserCard />
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      {loading && <p className="text-blue-500 mt-4 text-center">Processing...</p>}
    </div>
  );
};

export default ProfilePage;
