import React, { useState } from 'react';
import Banner from '../../../comon/Banner/Banner';
import SettingPage from '../../SettingPage/SettingPage'
import TrainersHeader from '../../../Headers/TrainersHeader';

function TrainersAbout() {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">


      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">

        <TrainersHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">

            <div className="sm:flex sm:justify-between sm:items-center mb-8">

              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold" style={{color :"#6495ED"}}>   Settings Page  </h1>
              </div>

              <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">                 
              </div>
            </div>
            <div >
                <SettingPage/>
              
            </div>

          </div>
        </main>

        <Banner />

      </div>
    </div>
  );
}

export default TrainersAbout;