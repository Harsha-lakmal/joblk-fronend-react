import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react'; // Importing from lucide-react for the message icon

function Banner() {
  const [bannerOpen, setBannerOpen] = useState(false);

  // Toggle the banner visibility
  const toggleBanner = () => {
    setBannerOpen(!bannerOpen);
  };

  // Injecting Botpress chat script into the component when banner is open
  useEffect(() => {
    if (bannerOpen) {
      const script = document.createElement('script');
      script.src = 'http://localhost:3000/assets/modules/channel-web/inject.js'; // Update with your Botpress URL if needed
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script); // Cleanup when banner is closed
      };
    }
  }, [bannerOpen]);

  return (
    <>
      <button 
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-gray-50 p-3 rounded-full shadow-lg hover:bg-gray-700"
        onClick={toggleBanner}
        aria-expanded={bannerOpen}
        aria-label={bannerOpen ? "Close Chat Banner" : "Open Chat Banner"}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {bannerOpen && (
        <div
          className="fixed bottom-0 right-0 w-full md:bottom-8 md:right-12 md:w-auto z-50 transform translate-y-0 transition-transform duration-300 ease-in-out"
        >
          <div className="bg-gray-800 border border-transparent dark:border-gray-700/60 text-gray-50 text-sm p-3 md:rounded-sm shadow-lg flex justify-between">
            <div className="text-gray-500 inline-flex">
              <span className="italic px-1.5">Chat Us</span>
            </div>
            <button
              className="text-gray-500 hover:text-gray-400 pl-2 ml-3 border-l border-gray-700/60"
              onClick={() => setBannerOpen(false)}
              aria-label="Close Chat Banner"
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 16 16">
                <path d="M12.72 3.293a1 1 0 00-1.415 0L8.012 6.586 4.72 3.293a1 1 0 00-1.414 1.414L6.598 8l-3.293 3.293a1 1 0 101.414 1.414l3.293-3.293 3.293 3.293a1 1 0 001.414-1.414L9.426 8l3.293-3.293a1 1 0 000-1.414z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Banner;
