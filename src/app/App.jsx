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

function App() {

  const location = useLocation();

  useEffect(() => {
    document.querySelector('html').style.scrollBehavior = 'auto'
    window.scroll({ top: 0 })
    document.querySelector('html').style.scrollBehavior = ''
  }, [location.pathname]);

  return (
    <>

      <Routes>
        <Route exact path="/*" element={<LoginPage/>} />
        <Route exact path="/signup" element={<LoginPage />} />
        <Route exact path="/sign" element={<SignPage />} />
      </Routes>



      {/* <Routes>
      <Route exact path="/*" element={<EmployeeDashboard />} />
        <Route exact path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route exact path="/employee/dashboard/about" element={<EmployeeAbout />} />
        <Route exact path="/employee/dashboard/course" element={<EmployeeCourse />} />
        <Route exact path="/employee/dashboard/job" element={<EmployeeJobPage />} />
      </Routes> */}


      {/* <Routes>
      <Route exact path="/*" element={<EmployeesDashboard />} />
        <Route exact path="/employees/dashboard" element={<EmployeesDashboard />} />
        <Route exact path="/employees/dashboard/about" element={<EmployeesAbout />} />
        <Route exact path="/employees/dashboard/course" element={<EmployeesCourse />} />
        <Route exact path="/employees/dashboard/job" element={<EmployeesJobPage />} />
      </Routes> */}



      {/* <Routes>
        <Route exact path="/*" element={<TrainersDashboard />} />
        <Route exact path="/trainers/dashboard" element={<TrainersDashboard />} />
        <Route exact path="/trainers/dashboard/about" element={<TrainersAbout />} />
        <Route exact path="/trainers/dashboard/course" element={<TrainersCourse />} />
        <Route exact path="/trainers/dashboard/job" element={<TrainersJobPage />} />
      </Routes> */}


      {/* <Routes>
        <Route exact path="/*" element={<AdminUserPage />} />
        <Route exact path="/admin/dashboard" element={<AdminUserPage />} />
        <Route exact path="/admin/dashboard/job" element={<AdminJobPage />} />
        <Route exact path="/admin/dashboard/course" element={<AdminCoursePage />} />
      </Routes> */}

    </>
  );
}

export default App;
