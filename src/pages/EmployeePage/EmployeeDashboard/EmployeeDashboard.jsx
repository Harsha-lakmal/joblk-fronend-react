import React, { useState } from 'react';

import EmployeeSidebar from '../../../partials/EmployeeSidebar';
import Header from '../../../partials/Header';
import Datepicker from '../../../components/Datepicker';
import Banner from '../../../comon/Banner/Banner';
import CourseCard from '../../../comon/CourseCard/CourseCard';
import JobCard from '../../../comon/JobCard/JobCard';

function EmployeeDashboard() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      <EmployeeSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            <div className="sm:flex sm:justify-between sm:items-center mb-8">

              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold"></h1>
              </div>

              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">

           

              </div>

            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-semibold mb-4">Available Courses</h2>
                <CourseCard />
              </section>

              <section>
                <h2 className="text-xl md:text-2xl text-gray-800 dark:text-gray-100 font-semibold mb-4">Job Opportunities</h2>
                <JobCard />
              </section>
            </div>

          </div>
        </main>

        <Banner />

      </div>
    </div>
  );
}

export default EmployeeDashboard;