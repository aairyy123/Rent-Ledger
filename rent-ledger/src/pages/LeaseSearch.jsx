// src/pages/LeaseSearch.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LeaseSearch = ({ leases = [], properties = [] }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const results = leases.filter(lease => 
      lease.leaseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.id?.toString().includes(searchTerm) ||
      lease.property?.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.tenant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lease.landlord?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(results);
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500 p-3 rounded-full">
                <span className="text-2xl text-white">🔍</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Lease Search</h1>
                <p className="text-gray-600">Search for lease agreements by ID, address, or wallet</p>
              </div>
            </div>
            <button
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Lease ID, Property, Tenant, or Landlord..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Search
            </button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Search Results ({searchResults.length})
            </h2>
            <div className="space-y-4">
              {searchResults.map((lease) => (
                <div key={lease.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{lease.property?.location}</h3>
                      <p className="text-sm text-gray-600">Lease ID: {lease.leaseId || lease.id}</p>
                      <p className="text-sm text-gray-600">Tenant: {lease.tenant?.slice(0, 8)}...{lease.tenant?.slice(-6)}</p>
                      <p className="text-sm text-gray-600">Landlord: {lease.landlord?.slice(0, 8)}...{lease.landlord?.slice(-6)}</p>
                      <p className="text-sm text-gray-600">Status: {lease.status}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      lease.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {lease.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaseSearch;