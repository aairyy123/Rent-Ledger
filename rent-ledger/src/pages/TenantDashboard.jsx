// src/pages/TenantDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TenantDashboard = ({
  account,
  setAccount,
  setUserRole,
  properties = [],
  leaseRequests = [],
  leases = []
}) => {
  const navigate = useNavigate();

  // Get tenant's active leases
  const activeLeases = leases.filter(lease =>
    lease.tenant && account &&
    lease.tenant.toLowerCase() === account.toLowerCase() &&
    lease.status === "active"
  );

  // Get all tenant's lease requests (pending, accepted, rejected)
  const myLeaseRequests = leaseRequests.filter(
    request => request.tenant && account && request.tenant.toLowerCase() === account.toLowerCase()
  );

  const handleSearchProperties = () => {
    navigate("/tenant/search");
  };

  const handleViewMyLeases = () => {
    navigate("/tenant/leases");
  };

  const handleLogout = () => {
    localStorage.removeItem("rentLedgerUserRole"); // Use correct localStorage key
    setUserRole(null);
    setAccount(null);
    navigate("/");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-purple-500 p-3 rounded-full">
              <span className="text-2xl text-white">👤</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Tenant Dashboard</h1>
              <p className="text-gray-600">Manage your rentals and lease agreements</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <p className="text-sm text-gray-600 mb-2">Connected Wallet:</p>
            <p className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">{account || "Not Connected"}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {properties.filter(p => p.status === 'available').length}
            </div>
            <div className="text-gray-600">Available Properties</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{myLeaseRequests.filter(r => r.status === 'pending').length}</div>
            <div className="text-gray-600">Pending Requests</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{activeLeases.length}</div>
            <div className="text-gray-600">Active Leases</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {myLeaseRequests.filter(r => r.status === 'accepted').length}
            </div>
            <div className="text-gray-600">Accepted Requests</div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleSearchProperties}
            className="bg-purple-500 hover:bg-purple-600 text-white p-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-xl font-bold mb-2">Search Properties</h3>
              <p className="text-purple-100">Find available properties for rent</p>
            </div>
          </button>

          <button
            onClick={handleViewMyLeases}
            className="bg-green-500 hover:bg-green-600 text-white p-8 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-xl font-bold mb-2">My Lease Agreements</h3>
              <p className="text-green-100">View your active lease agreements</p>
            </div>
          </button>
        </div>

        {/* Active Leases Preview */}
        {activeLeases.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>🏠</span> Your Active Leases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeLeases.slice(0, 2).map((lease) => (
                <div key={lease.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <h4 className="font-bold text-lg text-gray-800 mb-2">{lease.property?.location}</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Rent:</strong> {lease.rentAmount} ETH/{lease.paymentCycle}</p>
                    <p><strong>Duration:</strong> {lease.startDate} to {lease.endDate}</p>
                    <p><strong>Landlord:</strong> {lease.landlord?.slice(0, 8)}...{lease.landlord?.slice(-6)}</p>
                    <p><strong>Security Deposit:</strong> {lease.securityDeposit} ETH</p>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      ✅ Active
                    </span>
                    <button
                      onClick={handleViewMyLeases}
                      className="text-blue-600 hover:text-blue-800 text-sm font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>

          {myLeaseRequests.length === 0 && activeLeases.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 text-gray-300">🏠</div>
              <p className="text-gray-600 mb-4">No lease activity yet</p>
              <p className="text-sm text-gray-500 mb-4">Start by searching for properties</p>
              <button
                onClick={handleSearchProperties}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
              >
                Search Properties
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Show lease requests */}
              {myLeaseRequests.slice(0, 3).map((request) => {
                // Fallback to property data in state if not found in request object
                const property = properties.find(p => p.id === request.propertyId) || request.property;
                return (
                  <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex gap-4">
                      <img
                        src={property?.imagePreview || "https://via.placeholder.com/300x200"}
                        alt="Property"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{property?.location || "Unknown Property"}</h4>
                        <p className="text-sm text-gray-600">
                          Your Offer: <span className="font-semibold">{request.offer} ETH</span>
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Render a small action button if accepted but not leased (needs finalization) */}
                    {request.status === 'accepted' && !activeLeases.some(l => l.propertyId === request.propertyId) && (
                      <div className="mt-2 text-center">
                        <button
                          onClick={() => alert("Your lease request was accepted! Please contact the landlord to finalize the lease.")}
                          className="text-xs bg-blue-500 text-white px-3 py-1 rounded"
                        >
                          Finalize Lease
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Show active leases */}
              {activeLeases.slice(0, 3).map((lease) => (
                <div key={lease.id} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex gap-4">
                    <img
                      src={lease.property?.imagePreview || "https://via.placeholder.com/300x200"}
                      alt="Property"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{lease.property?.location}</h4>
                      <p className="text-sm text-gray-600">
                        Active Lease: <span className="font-semibold">{lease.rentAmount} ETH</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          ✅ Active Lease
                        </span>
                        <span className="text-xs text-gray-500">
                          Signed: {new Date(lease.signedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center cursor-pointer"
          >
            ← Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center cursor-pointer"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;