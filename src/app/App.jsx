import React, { useEffect,useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import '../css/style.css';
import EmployeeDashboard from '../pages/EmployeePage/EmployeeDashboard/EmployeeDashboard';
import EmployeeAbout from '../pages/EmployeePage/EmployeeAbout/EmployeeAbout';
import EmployeeCourse from '../pages/EmployeePage/EmployeeCourse/EmployeeCourse'
import EmployeeJobPage from '../pages/EmployeePage/EmployeeJobPage/EmployeeJobPage';

import EmployeesAbout from '../pages/EmployeesPage/EmployeesAbout/EmployeesAbout';
import EmployeesDashboard from '../pages/EmployeesPage/EmployeesDashboard/EmployeesDashboard';
import EmployeesJobPage from '../pages/EmployeesPage/EmployeesJobPage/EmployeesJobPage';
import EmployeesCourse from '../pages/EmployeesPage/EmployeesCourse/EmployeesCourse';

import TrainersJobPage from '../pages/TrainersPage/TrainersJobPage/TrainersJobPage';
import TrainersAbout from '../pages/TrainersPage/TrainersAbout/TrainersAbout';
import TrainersDashboard from '../pages/TrainersPage/TrainersDashboard/TrainersDashboard';
import TrainersCourse from '../pages/TrainersPage/TrainersCourse/TrainersCourse';

import AdminUserPage from '../pages/AdminPage/AdminUserPage/AdminUserPage';
import AdminCoursePage from '../pages/AdminPage/AdminCoursePage/AdminCoursePage';
import AdminJobPage from '../pages/AdminPage/AdminJobPage/AdminJobPage';

import LoginPage from '../pages/LoginPage/LoginPage';
import SignPage from '../pages/SignPage/SignPage'
import SettingPage from '../pages/SettingPage/SettingPage'
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
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      <Route path="/employee/dashboard/about" element={<EmployeeAbout />} />
      <Route path="/employee/dashboard/course" element={<EmployeeCourse />} />
      <Route path="/employee/dashboard/job" element={<EmployeeJobPage />} />
      <Route path="/employees/dashboard" element={<EmployeesDashboard />} />
      <Route path="/employees/dashboard/about" element={<EmployeesAbout />} />
      <Route path="/employees/dashboard/course" element={<EmployeesCourse />} />
      <Route path="/employees/dashboard/job" element={<EmployeesJobPage />} />
      <Route path="/trainers/dashboard" element={<TrainersDashboard />} />
      <Route path="/trainers/dashboard/about" element={<TrainersAbout />} />
      <Route path="/trainers/dashboard/course" element={<TrainersCourse />} />
      <Route path="/trainers/dashboard/job" element={<TrainersJobPage />} />
      <Route path="/admin/dashboard" element={<AdminUserPage />} />
      <Route path="/admin/dashboard/job" element={<AdminJobPage />} />
      <Route path="/admin/dashboard/course" element={<AdminCoursePage />} />    

    </Routes>
  );
}

export default App;
