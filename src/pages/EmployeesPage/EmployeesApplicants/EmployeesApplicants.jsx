import React, { useState, useEffect } from "react";
import joblkimg from "../../../Assets/joblk.png";
import Banner from "../../../comon/Banner/Banner";
import { instance } from "../../../Service/AxiosHolder/AxiosHolder";
import Swal from "sweetalert2";
import { CircleUserRound, X, Download, FileText, Trash2, Check, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmployeesHeader from "../../../Headers/EmployeesHeader";

function EmployeesApplicants() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [applicantImages, setApplicantImages] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  const showSuccessMessage = (message) => {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: message || "Operation successful",
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
      setError('No authentication token found.');
      setLoading(false);
      return;
    }

    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUserId(parsedUser.id);
    }

    getData();
  }, [token]);

  const getData = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/job/getAllJobDocuments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const applicantsData = response.data;
      setApplicants(applicantsData);
      
      if (currentUserId) {
        const filtered = applicantsData.filter(applicant => 
          applicant.userId === currentUserId
        );
        setFilteredApplicants(filtered);
      } else {
        setFilteredApplicants(applicantsData);
      }

      applicantsData.forEach(applicant => {
        if (applicant && applicant.id) {
          getApplicantImage(applicant.id);
        }
      });

      setLoading(false);
    } catch (error) {
      setError("Failed to load applicants.");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId && applicants.length > 0) {
      const filtered = applicants.filter(applicant => 
        applicant && applicant.userId === currentUserId
      );
      setFilteredApplicants(filtered);
    }
  }, [currentUserId, applicants]);

  const getApplicantImage = async (applicantId) => {
    try {
      const response = await instance.get(`/job/getDocumentImage/${applicantId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const imageUrl = URL.createObjectURL(response.data);
      setApplicantImages(prev => ({
        ...prev,
        [applicantId]: imageUrl
      }));
    } catch (error) {
      console.error('Error fetching applicant image:', error);
      setApplicantImages(prev => ({
        ...prev,
        [applicantId]: joblkimg
      }));
    }
  };

  const getCvDocument = async (applicantId) => {
    try {
      const response = await instance.get(`/job/getCvDocument/${applicantId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const cvBlob = new Blob([response.data], { type: response.headers['content-type'] });
      const cvUrl = URL.createObjectURL(cvBlob);
      
      return cvUrl;
    } catch (error) {
      console.error('Error fetching CV:', error);
      showErrorMessage("Failed to download CV");
      return null;
    }
  };

  const deleteDocument = async (applicantId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        await instance.delete(`/job/deleteDocument/${applicantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setApplicants(prev => prev.filter(applicant => applicant && applicant.id !== applicantId));
        setFilteredApplicants(prev => prev.filter(applicant => applicant && applicant.id !== applicantId));
        
        if (applicantImages[applicantId]) {
          URL.revokeObjectURL(applicantImages[applicantId]);
          setApplicantImages(prev => {
            const newImages = {...prev};
            delete newImages[applicantId];
            return newImages;
          });
        }

        showSuccessMessage('Applicant deleted successfully');
        
        if (showPopup && selectedApplicant && selectedApplicant.id === applicantId) {
          setShowPopup(false);
          setSelectedApplicant(null);
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      showErrorMessage("Failed to delete applicant");
    }
  };

  const handleDownloadCV = async (applicantId) => {
    try {
      const cvUrl = await getCvDocument(applicantId);
      if (!cvUrl) return;

      const link = document.createElement('a');
      link.href = cvUrl;
      link.setAttribute('download', `CV_${applicantId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(cvUrl), 100);
      
      showSuccessMessage("Successfully downloaded CV");
    } catch (error) {
      console.error('Error downloading CV:', error);
      showErrorMessage("Failed to download CV");
    }
  };

  const handleViewDetails = (applicant) => {
    setSelectedApplicant(applicant);
    setShowPopup(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    return () => {
      Object.values(applicantImages).forEach(url => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [applicantImages]);

  const acceptDocument = async (applicantId) => {
    try {
      const result = await Swal.fire({
        title: 'Accept Applicant?',
        text: "This will approve the applicant for the Job and remove them from the pending list.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, accept!'
      });
  
      if (result.isConfirmed) {
        const applicantToAccept = applicants.find(applicant => applicant && applicant.id === applicantId);
        
        if (!applicantToAccept) {
          throw new Error('Applicant not found');
        }
  
        const acceptJobseData = {
          jobDocumentId: applicantToAccept.id,
          username: applicantToAccept.username,
          qualifications: applicantToAccept.qualifications,
          age: applicantToAccept.age,
          gender: applicantToAccept.gender,
          applyDate: applicantToAccept.applyDate,
          userEmail: applicantToAccept.userEmail,
          number: applicantToAccept.number,
          address: applicantToAccept.address,
          jobId: applicantToAccept.jobId,
          userId: applicantToAccept.userId,
          jobTitle: applicantToAccept.jobTitle,
        };
  
        await instance.post(`/job/saveAcceptDocumentJob`, acceptJobseData, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        await instance.delete(`/job/deleteDocument/${applicantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setApplicants(prev => prev.filter(applicant => applicant && applicant.id !== applicantId));
        setFilteredApplicants(prev => prev.filter(applicant => applicant && applicant.id !== applicantId));
        
        if (applicantImages[applicantId]) {
          URL.revokeObjectURL(applicantImages[applicantId]);
          setApplicantImages(prev => {
            const newImages = {...prev};
            delete newImages[applicantId];
            return newImages;
          });
        }
  
        showSuccessMessage('Applicant accepted successfully');
        
        if (showPopup && selectedApplicant && selectedApplicant.id === applicantId) {
          setShowPopup(false);
          setSelectedApplicant(null);
        }
      }
    } catch (error) {
      console.error('Error accepting document:', error);
      showErrorMessage("Failed to accept applicant");
    }
  };

  const navigateToAcceptedApplicants = () => {
    navigate('/employees/dashboard/applicants/details');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <EmployeesHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {showPopup && selectedApplicant && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-xl">Applicant Details</h3>
              <button 
                onClick={() => setShowPopup(false)} 
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <img 
                  src={selectedApplicant && selectedApplicant.id && applicantImages[selectedApplicant.id] 
                    ? applicantImages[selectedApplicant.id] 
                    : joblkimg} 
                  alt="Applicant" 
                  className="w-16 h-16 rounded-full object-cover mr-4"
                  onError={(e) => {
                    e.target.src = joblkimg;
                  }}
                />
                <div>
                  <h4 className="font-bold text-lg">{selectedApplicant.username || 'N/A'}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{selectedApplicant.userEmail || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Age</p>
                  <p>{selectedApplicant.age || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Gender</p>
                  <p>{selectedApplicant.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Phone</p>
                  <p>{selectedApplicant.number || 'N/A'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-500 dark:text-gray-400">Applied Date</p>
                  <p>{formatDate(selectedApplicant.applyDate)}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium text-gray-500 dark:text-gray-400">Qualifications</p>
                  <p>{selectedApplicant.qualifications || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium text-gray-500 dark:text-gray-400">Address</p>
                  <p>{selectedApplicant.address || 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedApplicant.status !== 'ACCEPTED' && (
                  <button
                    onClick={() => acceptDocument(selectedApplicant.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition"
                  >
                    <Check size={16} />
                    Accept
                  </button>
                )}
                <button
                  onClick={() => handleDownloadCV(selectedApplicant.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition"
                >
                  <Download size={16} />
                  Download CV
                </button>
                <button
                  onClick={() => deleteDocument(selectedApplicant.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}  

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{ color: "#6495ED" }}>
                  Job Applicants
                </h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={navigateToAcceptedApplicants}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded transition"
                >
                  <ListChecks size={18} />
                  View Accepted Applicants
                </button>
              </div>
            </div>

            <div>
              {loading && <div className="text-center py-8">Loading applicants...</div>}
              {error && <div className="text-center py-8 text-red-500">{error}</div>}

              {!loading && filteredApplicants.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
                  No applicants available at the moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredApplicants.map((applicant) => (
                    applicant && (
                      <div key={applicant.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="p-4 flex items-start">
                          <img 
                            src={applicant.id && applicantImages[applicant.id] ? applicantImages[applicant.id] : joblkimg} 
                            alt="Applicant" 
                            className="w-16 h-16 rounded-full object-cover mr-4"
                            onError={(e) => {
                              e.target.src = joblkimg;
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{applicant.username || 'N/A'}</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{applicant.userEmail || 'N/A'}</p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                              Applied on: {formatDate(applicant.applyDate)}
                            </p>
                          </div>
                          <button 
                            onClick={() => handleViewDetails(applicant)}
                            className="text-gray-500 hover:text-blue-500 transition"
                            title="View details"
                          >
                            <CircleUserRound size={20} />
                          </button>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {applicant.jobTitle || 'N/A'}
                          </span>
                          <div className="flex gap-2">
                            {applicant.status !== 'ACCEPTED' && (
                              <button
                                onClick={() => acceptDocument(applicant.id)}
                                className="flex items-center gap-1 text-sm text-green-500 hover:text-green-600 dark:hover:text-green-400 transition"
                                title="Accept applicant"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDownloadCV(applicant.id)}
                              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                              title="Download CV"
                            >
                              <FileText size={16} />
                              CV
                            </button>
                            <button
                              onClick={() => deleteDocument(applicant.id)}
                              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 transition"
                              title="Delete applicant"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        <Banner />
      </div>
    </div>
  );
}

export default EmployeesApplicants;