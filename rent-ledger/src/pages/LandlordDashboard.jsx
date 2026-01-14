// src/pages/LandlordDashboard.jsx (UI FIX APPLIED - Horizontal Layout)
import React from "react";
import { useNavigate } from "react-router-dom";
import { getSafeImageUrl } from "../utils/imageUtils";
import { useWeb3 } from "../context/Web3Context"; // Assuming this is now correctly imported

const LandlordDashboard = ({
  account,
  setAccount,
  setUserRole,
  properties = [],
  leaseRequests = [],
  setLeaseRequests,
}) => {
  const navigate = useNavigate();

  // Access contracts from Web3Context if needed for future tx, but currently for reference
  // const { leaseRegistryContract } = useWeb3();

  const myProperties = Array.isArray(properties)
    ? properties.filter((p) => p.owner && account && p.owner.toLowerCase() === account.toLowerCase())
    : [];

  const myLeaseRequests = leaseRequests.filter(
    request => {
      const isMyProperty = myProperties.some(prop => prop.id === request.propertyId);
      const isActionable = request.status === "pending" || request.status === "accepted";
      return isMyProperty && isActionable;
    }
  );

  const handleGoToProperties = () => {
    navigate("/landlord/properties");
  };

  const handleBrowseMarket = () => {
    navigate("/tenant/search");
  };

  const handleAcceptRequest = (requestId) => {
    console.log("✅ Accepting lease request:", requestId);
    const request = leaseRequests.find(r => r.id === requestId);

    if (request) {
      console.log("📨 Request found:", request);

      // 1. CRITICAL: Update the request status to accepted immediately.
      // This ensures the request moves out of the 'pending' list on the current dashboard view.
      const updatedRequests = leaseRequests.map(req =>
        req.id === requestId ? { ...req, status: 'accepted' } : req
      );
      setLeaseRequests(updatedRequests);

      // 2. CRITICAL: Construct the correct routing path.
      // The CreateLease page expects the propertyId as a URL parameter and the tenant as a query parameter.
      const path = `/create-lease/${request.propertyId}?tenant=${request.tenant}`;

      console.log(`➡️ Navigating to lease creation form: ${path}`);
      navigate(path);

    } else {
      console.error("❌ Request not found:", requestId);
      alert("Lease request not found!");
    }
  };

  const handleRejectRequest = (requestId) => {
    if (window.confirm("Are you sure you want to reject this lease request?")) {
      const updatedRequests = leaseRequests.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' } : req
      );
      setLeaseRequests(updatedRequests);
      alert("Lease request rejected!");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rentLedgerUserRole");
    setUserRole(null);
    setAccount(null);
    navigate("/");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header Section - Clean Indigo Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-indigo-700 text-white rounded-xl shadow-2xl p-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-white p-3 rounded-xl text-indigo-700 shadow-md">
              <span className="text-3xl">👑</span>
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">Landlord Dashboard</h1>
              <p className="text-indigo-200 text-lg mt-1">Manage your properties and lease pipeline</p>
            </div>
          </div>

          <div className="flex flex-col items-end pt-2">
            <p className="text-sm text-indigo-200">Connected Wallet:</p>
            <p className="text-base font-mono bg-indigo-600 px-3 py-1 rounded-lg mt-1">{account || "Not Connected"}</p>
          </div>
        </div>

        {/* 1. Quick Stats - ALL THREE IN ONE HORIZONTAL LINE */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-indigo-200 pb-2">📊 Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Properties */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-indigo-600 hover:shadow-xl transition-shadow">
            <div className="text-5xl font-bold text-indigo-700">{myProperties.length}</div>
            <div className="text-lg font-semibold text-gray-600 mt-2">Total Properties</div>
          </div>
          {/* Pending Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="text-5xl font-bold text-orange-600">{myLeaseRequests.length}</div>
            <div className="text-lg font-semibold text-gray-600 mt-2">Pending Requests</div>
          </div>
          {/* Active Leases */}
          <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-green-600 hover:shadow-xl transition-shadow">
            <div className="text-5xl font-bold text-green-700">
              {myProperties.filter(p => p.status === 'leased').length}
            </div>
            <div className="text-lg font-semibold text-gray-600 mt-2">Active Leases</div>
          </div>
        </div>

        {/* 2. Main Actions - TWO BUTTONS IN ONE HORIZONTAL LINE */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b-4 border-indigo-200 pb-2">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <button
            onClick={handleGoToProperties}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-10 rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-b-4 border-indigo-800"
          >
            <div className="text-center">
              <div className="text-5xl mb-3">🏘️</div>
              <h3 className="text-2xl font-bold mb-1">Manage Properties</h3>
              <p className="text-indigo-200 text-lg">Register, view, and modify your listed assets.</p>
            </div>
          </button>

          <button
            onClick={handleBrowseMarket}
            className="bg-blue-600 hover:bg-blue-700 text-white p-10 rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-b-4 border-blue-800"
          >
            <div className="text-center">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-2xl font-bold mb-1">Browse Market</h3>
              <p className="text-blue-200 text-lg">Explore properties and perform market research.</p>
            </div>
          </button>
        </div>

        {/* 3. Lease Requests & 4. Your Properties - SIDE-BY-SIDE IN ONE HORIZONTAL ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Lease Requests Section - High Priority */}
          {myLeaseRequests.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>📨</span> Lease Requests ({myLeaseRequests.length})
              </h2>
              <div className="space-y-4">
                {myLeaseRequests.map((request) => {
                  const property = myProperties.find(p => p.id === request.propertyId);
                  return (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-5 bg-orange-50 hover:bg-orange-100 transition">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800 mb-1">
                            Request for: {property?.location || "Unknown Property"}
                          </h4>
                          <p className="text-base text-gray-700">
                            👤 Tenant: {request.tenant?.slice(0, 8)}...{request.tenant?.slice(-6)}
                          </p>
                          <p className="text-lg text-gray-800 font-extrabold mt-2">
                            💰 Offer: <span className="text-orange-700">{request.offer} ETH</span>
                          </p>
                        </div>
                        <div className="flex gap-3 mt-4 md:mt-0">
                          {request.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleAcceptRequest(request.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition shadow-md"
                              >
                                ✅ Accept
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold transition shadow-md"
                              >
                                ❌ Reject
                              </button>
                            </>
                          ) : (
                            // NEW: If status is 'accepted' (meaning, the landlord already clicked accept)
                            <button
                              onClick={() => handleAcceptRequest(request.id)} // Re-runs the navigation logic
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold transition shadow-md"
                            >
                              📄 Finalize Lease
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center border-l-4 border-gray-300">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
                <span>📨</span> Lease Requests
              </h2>
              <div className="text-6xl mb-4 text-gray-300">📧</div>
              <p className="text-lg text-gray-600 mb-2">No pending lease requests at this time.</p>
              <p className="text-sm text-gray-500">When tenants send lease requests, they will appear here for your review.</p>
            </div>
          )}

          {/* Your Properties Section - Side by side with Lease Requests */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-between">
              <span>🏡 Your Listed Properties</span>
              {myProperties.length > 0 && (
                <button
                  onClick={handleGoToProperties}
                  className="text-lg text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  View All ({myProperties.length}) →
                </button>
              )}
            </h2>
            {myProperties.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 text-gray-300">🏘️</div>
                <p className="text-lg text-gray-600 mb-4">You haven't registered any properties yet.</p>
                <button
                  onClick={handleGoToProperties}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition shadow-md"
                >
                  Register Your First Property
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6"> {/* Changed to col-1 for vertical listing inside the section */}
                {myProperties.slice(0, 2).map((property) => ( // Limiting to 2 for better side-by-side display
                  <div key={property.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-lg transition flex flex-col sm:flex-row items-center gap-4">
                    <img
                      src={getSafeImageUrl(property.imagePreview)}
                      alt={property.location}
                      className="w-full sm:w-24 h-24 object-cover rounded-md flex-shrink-0"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400";
                      }}
                    />
                    <div className="text-center sm:text-left flex-grow">
                      <h4 className="text-lg font-bold text-gray-800">{property.location}</h4>
                      <p className="text-sm text-gray-600">Area: {property.area} km²</p>
                      <p className="text-md font-semibold text-indigo-700">Rent: {property.rentOffer} ETH</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 inline-block ${property.status === 'available'
                        ? 'bg-green-100 text-green-800'
                        : property.status === 'leased'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {property.status || 'Available'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 5. Footer Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center cursor-pointer shadow-md"
          >
            ← Back to Home
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2 justify-center cursor-pointer shadow-md"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;