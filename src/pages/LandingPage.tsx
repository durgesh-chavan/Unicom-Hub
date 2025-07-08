import React, { useState } from "react";
import SignIn from "../components/SignIn";
import SignUp from "../components/SignUp";

const LandingPage = () => {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8 flex items-center justify-center space-x-4">
        <h1 className="text-5xl font-bold text-white mb-2">Unicom Hub</h1>
        <img 
          src="/logo.jpeg" 
          alt="Unicom Hub Logo" 
          className="w-16 h-16 rounded-full" 
        />
      </div>
      <p className="text-xl text-gray-200 text-center max-w-lg">
        Your all-in-one solution for bulk messaging via WhatsApp, SMS, and Email.
      </p>

      {/* Auth Toggle Buttons */}
      <div className="flex space-x-4 mt-6 mb-8">
        <button
          onClick={() => setShowSignIn(true)}
          className={`px-6 py-2 rounded-lg font-semibold ${
            showSignIn
              ? "bg-white text-blue-600"
              : "bg-transparent text-white border border-white"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setShowSignIn(false)}
          className={`px-6 py-2 rounded-lg font-semibold ${
            !showSignIn
              ? "bg-white text-blue-600"
              : "bg-transparent text-white border border-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Auth Form */}
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {showSignIn ? <SignIn /> : <SignUp />}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-200">
        <p>© 2025 Unicom Hub. All rights reserved.</p>
      </div>
    </div>
  );
};

export default LandingPage;
