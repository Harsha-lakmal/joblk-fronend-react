import React, { useState } from 'react';

import Header from '../../../partials/Header';
import Banner from '../../../comon/Banner/Banner';
import EmployeesSidebar from '../../../partials/EmployeesSidebar';
import CourseCard from '../../../comon/CourseCard/CourseCard';

function EmployeesCourse() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <EmployeesSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        {/*  Site header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            {/* Dashboard actions */}
            <div className="sm:flex sm:justify-between sm:items-center mb-8">

              {/* Left: Title */}
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold"> Course  Page </h1>
              </div>

              {/* Right: Actions */}
              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                {/* Filter button */}
                {/* Datepicker built with React Day Picker */}
                {/* Add view button */}

                            
              </div>

            </div>

            {/* Cards */}
            <div >

            <CourseCard/>
        

      
            </div>

          </div>
          
        </main>

        <Banner />

      </div>
    </div>
  );
}

export default EmployeesCourse;