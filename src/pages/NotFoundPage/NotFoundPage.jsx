import React from "react";
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    function nav() {
        navigate('/signup');
        console.log("Navigating to signup...");
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-center px-4">
            <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-purple-600">
                Oops!
            </h1>
            <h2 className="text-2xl font-semibold mt-4 text-white">404 - PAGE NOT FOUND</h2>
            <p className="text-gray-400 mt-2 max-w-md">
                User cannot log in. Please use the mobile app instead.
            </p>
            <button 
                className="mt-6 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-full font-semibold shadow-md transition duration-300 ease-in-out"
                onClick={nav}
            > 
                Go to Signup
            </button>
        </div>
    );
};

export default NotFoundPage;
