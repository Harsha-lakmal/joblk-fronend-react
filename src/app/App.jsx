import React, { useEffect,useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import '../css/style.css';
import EmployeesAbout from '../pages/EmployeesPage/EmployeesAbout/EmployeesAbout';
import EmployeesJobPage from '../pages/EmployeesPage/EmployeesJobPage/EmployeesJobPage';
import EmployeesApplicants from '../pages/EmployeesPage/EmployeesApplicants/EmployeesApplicants'
import EmployeesHome from '../pages/EmployeesPage/EmployeesHome/EmployeesHome';

import TrainersApplicants from '../pages/TrainersPage/TrainersApplicants/TrainersApplicants';
import TrainersAbout from '../pages/TrainersPage/TrainersAbout/TrainersAbout';
import TrainersHome from '../pages/TrainersPage/TrainersHome/TrainersHome';
import TrainersCourse from '../pages/TrainersPage/TrainersCourse/TrainersCourse';

import AdminUserPage from '../pages/AdminPage/AdminUserPage/AdminUserPage';
import AdminCoursePage from '../pages/AdminPage/AdminCoursePage/AdminCoursePage';
import AdminJobPage from '../pages/AdminPage/AdminJobPage/AdminJobPage';
import AdminAboutPage from '../pages/AdminPage/AdminAboutPage/AdminAboutPage';

import LoginPage from '../pages/LoginPage/LoginPage';
import SignPage from '../pages/SignPage/SignPage'
import NotFoundPage from '../pages/NotFoundPage/NotFoundPage';

import AcceptJobDocumentDetails from '../comon/AcceptJobDocumentDetails/AcceptJobDocumentDetails';
import AcceptCourseDocumentDetails from '../comon/AcceptCourseDocumentDetails/AcceptCourseDocumentDetails ';

function App() {
  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto';
    window.scroll({ top: 0 });
    document.querySelector('html').style.scrollBehavior = '';
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/*" element={<LoginPage />} />
      <Route path="/signup" element={<LoginPage />} /> 
      <Route path="/sign" element={<SignPage />} />
      <Route path="/employees/dashboard/home" element={<EmployeesHome />} />
      <Route path="/employees/dashboard/settings" element={<EmployeesAbout />} />
      <Route path="/employees/dashboard/applicants" element={<EmployeesApplicants />} />
      <Route path="/employees/dashboard/job" element={<EmployeesJobPage />} />
      <Route path="/trainers/dashboard/home" element={<TrainersHome />} />
      <Route path="/trainers/dashboard/settings" element={<TrainersAbout />} />
      <Route path="/trainers/dashboard/course" element={<TrainersCourse />} />
      <Route path="/trainers/dashboard/applicants" element={<TrainersApplicants/>} />
      <Route path="/admin/dashboard/users" element={<AdminUserPage />} />
      <Route path="/admin/dashboard/job" element={<AdminJobPage />} />
      <Route path="/admin/dashboard/course" element={<AdminCoursePage />} />  
      <Route path="/admin/dashboard/settings" element={<AdminAboutPage />} />    
      <Route path="/employees/dashboard/applicants/details" element={<AcceptJobDocumentDetails />} />
      <Route path="/trainers/dashboard/applicants/details" element={<AcceptCourseDocumentDetails/>} />
      <Route path="/error" element={<NotFoundPage />} />    
    </Routes>
  

  );
}


export default App;