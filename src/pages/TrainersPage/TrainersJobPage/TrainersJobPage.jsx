import React, { useState, useEffect } from "react";
import { instance } from "../../../Service/AxiosHolder/AxiosHolder";
import Header from "../../../partials/Header";
import Datepicker from "../../../components/Datepicker";
import Banner from "../../../comon/Banner/Banner";
import TrainersSidebar from "../../../partials/TrainersSidebar";
import Swal from "sweetalert2";

function TrainersJobPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobImages, setJobImages] = useState({});
  const token = localStorage.getItem("authToken");

  const showSuccessMessage = () => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: "Successfully uploaded your CV.",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const showErrorMessage = (msg) => {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: msg || "Error. Try again later.",
      showConfirmButton: false,
      timer: 2000,
    });
  };

  useEffect(() => {
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }
    getData();
    const interval = setInterval(() => {
      getData();
    }, 40000);

    return () => clearInterval(interval);
  }, []);

  function getData() {
    if (!token) return;
    instance
      .get("/job/getAllJobs", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setJobs(response.data.content);
        const newImages = {};
        response.data.content.forEach((job) => {
          getimg(job.jobId, newImages);
        });
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load jobs.");
        setLoading(false);
        console.error(error);
      });
  }

  const getimg = (jobId, newImages) => {
    instance
      .get(`/job/get/image/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })
      .then((res) => {
        newImages[jobId] = URL.createObjectURL(res.data);
        setJobImages((prevImages) => ({ ...prevImages, ...newImages }));
      })
      .catch((err) => {
        console.error("Error fetching image:", err);
      });
  };

  const cvUploadHandle = async () => {
    try {
      const storedUserData = localStorage.getItem("userData");
      if (!storedUserData) {
        showErrorMessage("User data not found.");
        return;
      }

      const parsedUserData = JSON.parse(storedUserData);
      const userId = parsedUserData.id;
      if (!userId || !token) return;

      const response = await instance.get(`/user/getCvDocument/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      if (response.data) {
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log(reader.result);
          showSuccessMessage();
        };
        reader.readAsDataURL(response.data);
      }
    } catch (err) {
      showErrorMessage();
      console.error("Error fetching CV document:", err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      // Implement upload logic here
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <TrainersSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{color :"#6495ED"}}>Job opportunity</h1>
              </div>

              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                <Datepicker align="right" />
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.length === 0 ? (
                  <div className="col-span-full text-center py-4">No jobs available at the moment.</div>
                ) : (
                  jobs.map((job) => (
                    <div
                      key={job.jobId}
                      className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-8 flex flex-col transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      <div className="relative w-full h-56">
                        <img
                          src={jobImages[job.jobId] || "/path/to/default/image.jpg"}
                          alt="Job Image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-5">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{job.jobTitle}</h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">{job.jobDescription}</p>
                        <ul className="mt-4 space-y-3">
                          <li>
                            <span className="font-medium text-gray-800 dark:text-gray-100">Qualifications:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{job.qualifications}</p>
                          </li>
                          <li>
                            <span className="font-medium text-gray-800 dark:text-gray-100">Closing Date:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{job.jobClosingDate}</p>
                          </li>
                          <li>
                            <span className="font-medium text-gray-800 dark:text-gray-100">Location:</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Panadura</p>
                          </li>
                        </ul>
                        <div className="mt-6">
                          <label htmlFor={`file-upload-${job.jobId}`} className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                            Upload Your CV:
                          </label>
                          <div className="mt-2 flex items-center space-x-4">
                            <input id={`file-upload-${job.jobId}`} type="file" accept=".pdf, .docx, .txt" className="hidden" onChange={handleFileChange} />
                            <button type="button" onClick={cvUploadHandle} className="bg-blue-500 text-white py-2 px-10 rounded-md">
                              Upload CV
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>

        <Banner />
      </div>
    </div>
  );
}

export default TrainersJobPage;
