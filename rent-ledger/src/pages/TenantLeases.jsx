// src/pages/TenantLeases.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const TenantLeases = ({ account, leases = [], properties = [] }) => {
  const navigate = useNavigate();

  // Get tenant's active leases
  const myLeases = leases.filter(lease =>
    lease.tenant && account &&
    lease.tenant.toLowerCase() === account.toLowerCase()
  );

  // Helper function to find property location robustly
  const getPropertyLocation = (lease) => {
    if (lease.property?.location) return lease.property.location;
    const prop = properties.find(p => p.id === lease.propertyId);
    return prop ? prop.location : "Unknown Property";
  };

  const handleBack = () => {
    navigate("/tenant");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-purple-500 p-3 rounded-full">
              <span className="text-2xl text-white">📄</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Lease Agreements</h1>
              <p className="text-gray-600">View and manage your active leases</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition cursor-pointer"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Lease Agreements */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📋 Your Lease Agreements ({myLeases.length})
          </h2>

          {myLeases.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-gray-300">📄</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Active Leases
              </h3>
              <p className="text-gray-500 mb-4">
                You don't have any active lease agreements yet.
              </p>
              <button
                onClick={() => navigate("/tenant/search")}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition cursor-pointer"
              >
                Search Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myLeases.map((lease) => (
                <div key={lease.id} className="border-2 border-green-200 rounded-xl p-6 bg-green-50 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-gray-800">{getPropertyLocation(lease)}</h3>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      ✅ Active
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lease ID:</span>
                      <span className="font-mono text-sm font-semibold">{lease.leaseId || lease.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rent Amount:</span>
                      <span className="font-semibold">{lease.rentAmount} ETH/{lease.paymentCycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Security Deposit:</span>
                      <span className="font-semibold">{lease.securityDeposit} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lease Period:</span>
                      <span className="font-semibold">
                        {new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Landlord:</span>
                      <span className="font-mono text-sm">
                        {lease.landlord?.slice(0, 8)}...{lease.landlord?.slice(-6)}
                      </span>
                    </div>
                  </div>

                  {/* Lease Agreement Document Section */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Lease Agreement:</h4>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-40 overflow-y-auto">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {lease.leaseAgreementDocument || "Lease agreement document will be generated soon..."}
                      </pre>
                    </div>
                    <button
                      onClick={() => {
                        // Download lease agreement as text file
                        const element = document.createElement('a');
                        const file = new Blob([lease.leaseAgreementDocument || "No lease agreement available"], { type: 'text/plain' });
                        element.href = URL.createObjectURL(file);
                        element.download = `lease-agreement-${lease.leaseId || lease.id}.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      📄 Download Agreement
                    </button>
                  </div>

                  {lease.terms && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Additional Terms:</h4>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                        {lease.terms}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <span className="font-semibold text-gray-700">Landlord Signature</span>
                        <p className="text-xs text-gray-500 mt-1">
                          {lease.landlordSignature ? '✅ Signed' : '❌ Pending'}
                        </p>
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-gray-700">Your Signature</span>
                        <p className="text-xs text-gray-500 mt-1">
                          {lease.tenantSignature ? '✅ Signed' : '❌ Pending'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    <p>Lease ID: {lease.leaseId || lease.id}</p>
                    <p>Created: {new Date(lease.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantLeases;