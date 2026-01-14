// src/pages/Home.js (UI FIX APPLIED)
import React from "react";
import { useNavigate } from "react-router-dom";
import WalletConnect from "../components/WalletConnect";

const Home = ({ account, setAccount, setUserRole }) => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }
    localStorage.setItem("rentLedgerUserRole", role);
    setUserRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-blue-900 to-indigo-900 flex flex-col justify-center items-center text-center text-white p-6">
      <div className="max-w-4xl">
        {/* Main Header */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 text-white tracking-tight">
            🏠 Rent Ledger
          </h1>
          <p className="text-2xl md:text-3xl mb-8 font-light text-indigo-200">
            Secure • Transparent • Blockchain-Powered Rentals
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="mb-12">
          <WalletConnect account={account} setAccount={setAccount} />
        </div>

        {/* Role Selection */}
        {account && (
          <div className="mb-16">
            <p className="text-xl mb-8 font-semibold text-indigo-100">Choose your role to continue:</p>
            <div className="flex flex-col md:flex-row gap-8 justify-center">
              <button
                onClick={() => handleRoleSelect("landlord")}
                className="bg-white text-indigo-700 px-12 py-6 rounded-xl text-xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-indigo-500/50 flex items-center gap-4"
              >
                <span className="text-3xl">👑</span>
                <div className="text-left">
                  <div className="text-2xl font-bold">Landlord</div>
                  <div className="text-sm font-normal">Manage properties & leases</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect("tenant")}
                className="bg-indigo-600 hover:bg-indigo-500 px-12 py-6 rounded-xl text-xl font-bold transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-indigo-500/50 flex items-center gap-4"
              >
                <span className="text-3xl">👤</span>
                <div className="text-left">
                  <div className="text-2xl font-bold">Tenant</div>
                  <div className="text-sm font-normal opacity-90">Find & rent properties</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/50">
            <div className="text-4xl mb-4 text-indigo-300">🔒</div>
            <h3 className="text-xl font-bold mb-2">Secure</h3>
            <p className="text-white text-opacity-90">Blockchain-powered security for all transactions</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/50">
            <div className="text-4xl mb-4 text-indigo-300">⚡</div>
            <h3 className="text-xl font-bold mb-2">Fast</h3>
            <p className="text-white text-opacity-90">Quick property listing and lease processing</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/50">
            <div className="text-4xl mb-4 text-indigo-300">💎</div>
            <h3 className="text-xl font-bold mb-2">Transparent</h3>
            <p className="text-white text-opacity-90">Clear terms and verifiable records</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-indigo-400/50 pt-8">
          <p className="text-white text-opacity-70">
            Powered by Ethereum • Smart Contract Verified • IPFS Storage
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;