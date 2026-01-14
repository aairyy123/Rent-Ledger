// src/pages/CreateLease.jsx (DEFINITIVE FIX)
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DigitalSignature from "../components/DigitalSignature";

const CreateLease = ({
  account,
  properties,
  setProperties,
  leaseRequests,
  setLeaseRequests,
  setLeases
}) => {
  const navigate = useNavigate();
  const { propertyId } = useParams(); // propertyId is the URL parameter (STRING)
  const [searchParams] = useSearchParams();
  const tenantAddress = searchParams.get('tenant');

  // --- CRITICAL FIX START ---
  // The propertyId might be a string (e.g., "prop_1762...") or a pure number ID.
  // We normalize the ID from the URL (propertyId) to a string and use a robust find function.

  const propertyIdString = String(propertyId); // Ensure URL parameter is handled as a string

  // Use a robust find function that works whether p.id is string or number
  const property = properties.find(p => String(p.id) === propertyIdString);

  // Define a variable for the property ID used in state/requests, 
  // which is necessary if we can't use property.id because property is null.
  // If property is found, use its actual ID; otherwise, use the URL string.
  const actualPropertyId = property ? property.id : propertyIdString;

  const [leaseDetails, setLeaseDetails] = useState({
    tenant: tenantAddress || "",
    propertyId: actualPropertyId, // Store the ID found or the string from URL
    startDate: "",
    endDate: "",
    rentAmount: "",
    securityDeposit: "",
    paymentCycle: "monthly",
    terms: "",
    landlordSignature: null,
    tenantSignature: null,
    status: "pending"
  });

  const [showTenantSignature, setShowTenantSignature] = useState(false);

  useEffect(() => {
    if (property && !leaseDetails.rentAmount) {
      setLeaseDetails(prev => ({
        ...prev,
        rentAmount: property.rentOffer,
        securityDeposit: (parseFloat(property.rentOffer) * 2).toFixed(3)
      }));
    }
  }, [property]);

  const handleLandlordSign = (signatureData) => {
    setLeaseDetails(prev => ({
      ...prev,
      landlordSignature: signatureData
    }));
    setShowTenantSignature(true);
  };

  const handleTenantSign = (signatureData) => {
    setLeaseDetails(prev => ({
      ...prev,
      tenantSignature: signatureData
    }));
  };

  const handleCreateLease = (e) => {
    e.preventDefault();

    if (!leaseDetails.startDate || !leaseDetails.endDate || !leaseDetails.rentAmount) {
      alert("Please fill in all required fields!");
      return;
    }

    if (!leaseDetails.landlordSignature || !leaseDetails.tenantSignature) {
      alert("Both landlord and tenant must sign the lease agreement!");
      return;
    }

    try {

      // Generate lease agreement document content
      const leaseAgreementContent = `
LEASE AGREEMENT

Property: ${property.location}
Lease ID: ${Date.now()}
Landlord: ${account}
Tenant: ${leaseDetails.tenant}
Rent Amount: ${leaseDetails.rentAmount} ETH per ${leaseDetails.paymentCycle}
Security Deposit: ${leaseDetails.securityDeposit} ETH
Lease Period: ${leaseDetails.startDate} to ${leaseDetails.endDate}
Payment Cycle: ${leaseDetails.paymentCycle}

Additional Terms:
${leaseDetails.terms || "No additional terms specified."}

Signatures:
Landlord: ${leaseDetails.landlordSignature?.signature}
Tenant: ${leaseDetails.tenantSignature?.signature}

Created: ${new Date().toISOString()}
    `.trim();

      // Create complete lease agreement
      const leaseAgreement = {
        ...leaseDetails,
        id: Date.now(),
        property: property,
        landlord: account,
        status: "active",
        createdAt: new Date().toISOString(),
        signedAt: new Date().toISOString(),
        leaseAgreementDocument: leaseAgreementContent, // Store the document content
        leaseId: `LEASE_${Date.now()}` // Generate lease ID
      };

      // Update property status to leased
      // Use the reliable ID stored in actualPropertyId (which is property.id)
      const updatedProperties = properties.map(p =>
        String(p.id) === String(actualPropertyId)
          ? {
            ...p,
            status: 'leased',
            currentLease: leaseAgreement,
            leasedTo: tenantAddress,
            leasedAt: new Date().toISOString(),
            leaseId: leaseAgreement.leaseId // Store lease ID with property
          }
          : p
      );

      setProperties(updatedProperties);

      // Remove the lease request
      const updatedRequests = leaseRequests.filter(
        req => !(String(req.propertyId) === String(actualPropertyId) && req.tenant === tenantAddress)
      );
      setLeaseRequests(updatedRequests);

      // Save lease agreement to leases state
      setLeases(prevLeases => {
        const updatedLeases = [...prevLeases, leaseAgreement];
        localStorage.setItem("rentLedgerLeases", JSON.stringify(updatedLeases));
        return updatedLeases;
      });

      alert("✅ Lease agreement created and signed by both parties!");
      navigate("/landlord");
    } catch (error) {
      console.error("Error creating lease:", error);
      alert("Error creating lease agreement. Please try again.");
    }
  };

  const handleBack = () => {
    navigate("/landlord");
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-xl shadow-2xl border-t-4 border-red-500">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Property Not Found</h2>
          <p className="text-red-500 mb-4">The property ID from the URL does not match any registered property in the system.</p>
          <p className="text-sm text-gray-500 mb-6">Check console for debug info on the missing ID: {propertyId}</p>
          <button
            onClick={handleBack}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-green-500 p-3 rounded-full">
                <span className="text-2xl text-white">📝</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Create Lease Agreement</h1>
                <p className="text-gray-600">For property: {property.location}</p>
                <p className="text-sm text-gray-500">
                  Both landlord and tenant must sign this agreement
                </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Info & Signatures */}
          <div className="space-y-6">
            {/* Property Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Property Details</h3>
              <img
                src={property.imagePreview || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400"}
                alt={property.location}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <div className="space-y-2">
                <p><strong>Location:</strong> {property.location}</p>
                <p><strong>Area:</strong> {property.area} km²</p>
                <p><strong>Type:</strong> {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}</p>
                <p><strong>Original Price:</strong> {property.rentOffer} ETH</p>
                <p><strong>Owner:</strong> {property.owner?.slice(0, 8)}...{property.owner?.slice(-6)}</p>
              </div>
            </div>

            {/* Digital Signatures */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Digital Signatures</h3>

              {/* Landlord Signature - Always visible */}
              <DigitalSignature
                account={account}
                onSign={handleLandlordSign}
                role="landlord"
                document={{
                  propertyLocation: property.location,
                  rentAmount: leaseDetails.rentAmount
                }}
              />

              {/* Tenant Signature - Only show after landlord signs */}
              {showTenantSignature && (
                <div className="mt-4">
                  <DigitalSignature
                    account={leaseDetails.tenant}
                    onSign={handleTenantSign}
                    role="tenant"
                    document={{
                      propertyLocation: property.location,
                      rentAmount: leaseDetails.rentAmount
                    }}
                  />
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700">
                      <strong>Note to Tenant:</strong> Please connect with wallet address: {leaseDetails.tenant}
                    </p>
                  </div>
                </div>
              )}

              {!showTenantSignature && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Next Step:</strong> Landlord must sign first, then tenant can sign.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Lease Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <form onSubmit={handleCreateLease} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tenant Wallet Address *
                  </label>
                  <input
                    type="text"
                    value={leaseDetails.tenant}
                    onChange={(e) => setLeaseDetails({ ...leaseDetails, tenant: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    required
                    placeholder="0x..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rent Amount (ETH) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={leaseDetails.rentAmount}
                    onChange={(e) => setLeaseDetails({ ...leaseDetails, rentAmount: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={leaseDetails.startDate}
                    onChange={(e) => setLeaseDetails({ ...leaseDetails, startDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={leaseDetails.endDate}
                    onChange={(e) => setLeaseDetails({ ...leaseDetails, endDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Deposit (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={leaseDetails.securityDeposit}
                    onChange={(e) => setLeaseDetails({ ...leaseDetails, securityDeposit: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Cycle
                  </label>
                  <select
                    value={leaseDetails.paymentCycle}
                    onChange={(e) => setLeaseDetails({ ...leaseDetails, paymentCycle: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Terms
                </label>
                <textarea
                  value={leaseDetails.terms}
                  onChange={(e) => setLeaseDetails({ ...leaseDetails, terms: e.target.value })}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="Enter any additional terms and conditions..."
                />
              </div>

              {/* Signature Status */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Signature Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className={`p-2 rounded ${leaseDetails.landlordSignature ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    🏠 Landlord: {leaseDetails.landlordSignature ? '✅ Signed' : '⏳ Pending'}
                  </div>
                  <div className={`p-2 rounded ${leaseDetails.tenantSignature ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    👤 Tenant: {leaseDetails.tenantSignature ? '✅ Signed' : '⏳ Pending'}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!leaseDetails.landlordSignature || !leaseDetails.tenantSignature}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold text-lg transition"
              >
                {leaseDetails.landlordSignature && leaseDetails.tenantSignature
                  ? "📄 Activate Lease Agreement"
                  : "⏳ Waiting for Signatures"}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateLease;