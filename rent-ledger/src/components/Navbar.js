// src/components/Navbar.js
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = ({ setUserRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    setUserRole(null);
    navigate("/");
  };

  return (
    <div className="w-full flex justify-between items-center bg-indigo-700 text-white p-4">
      <div className="text-2xl font-semibold">Rent Ledger</div>
      <div className="flex gap-4">
        {location.pathname !== "/" && (
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-lg transition"
          >
            Back
          </button>
        )}
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
