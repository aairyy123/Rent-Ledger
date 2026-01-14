// src/pages/LandlordProperties.jsx 
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertFileToBase64, getSafeImageUrl } from "../utils/imageUtils";
import { useWeb3 } from "../context/Web3Context"; // Retaining import

const LandlordProperties = ({ account, properties, setProperties, setUserRole }) => {
  const navigate = useNavigate();
  // Removed unused useWeb3 hooks from declaration to clean up.

  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [rentOffer, setRentOffer] = useState("");
  const [listingType, setListingType] = useState("rent");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [certificatePreview, setCertificatePreview] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // FIX 1: State to track submission count for key-based component reset
  const [submissionKey, setSubmissionKey] = useState(0);


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size too large! Please use images under 2MB.");
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCertificateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Certificate size too large! Please use files under 2MB.");
        return;
      }
      setCertificate(file);
      setCertificatePreview(URL.createObjectURL(file));
    }
  };

  const handleRegisterProperty = async (e) => {
    e.preventDefault();

    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }

    // FIX 2: Use the most reliable check: text fields must be filled AND file objects must be present.
    if (!location.trim() || !area || !rentOffer || !image || !certificate) {
      alert("Please fill all fields and upload required documents!");
      return;
    }

    if (isRegistering) {
      alert("Registration in progress, please wait...");
      return;
    }

    setIsRegistering(true);

    try {
      const newId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const base64Image = preview && preview.startsWith('blob:') ? await convertFileToBase64(image) : getSafeImageUrl(preview);

      const newProperty = {
        id: newId,
        location: location.trim(),
        area: area.toString(),
        rentOffer: rentOffer.toString(),
        listingType: listingType,
        owner: account,
        imagePreview: base64Image,
        certificatePreview: "certificate_uploaded",
        status: "available",
        createdAt: new Date().toISOString(),
      };

      console.log("🏠 Registering new property:", newProperty);

      setProperties(prev => {
        const updated = [...prev, newProperty];
        return updated;
      });

      alert("✅ Property registered successfully!");

      // Reset text state
      setLocation("");
      setArea("");
      setRentOffer("");
      setListingType("rent");

      // Clear file state
      setImage(null);
      setPreview(null);
      setCertificate(null);
      setCertificatePreview(null);

      // FIX 3: Increment key to force file inputs to reset completely after successful registration
      setSubmissionKey(prev => prev + 1);

    } catch (error) {
      console.error("❌ Error in property registration:", error);
      alert("Error registering property. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleBack = () => {
    navigate("/landlord");
  };

  const handleLogout = () => {
    localStorage.removeItem("rentLedgerUserRole");
    setUserRole(null);
    navigate("/");
  };

  const handleDeleteProperty = (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      alert("🗑️ Property deleted successfully!");
    }
  };

  const myProperties = properties.filter(
    (p) => p.owner && account && p.owner.toLowerCase() === account.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header (Keeping the blue theme) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-indigo-700 text-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-white p-3 rounded-full text-indigo-700">
              <span className="text-2xl">🏘️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Property Management</h1>
              <p className="text-indigo-200">Register and manage your properties</p>
              <p className="text-sm text-green-300 font-semibold">
                ✅ Your Properties: {myProperties.length} | You can register unlimited properties
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition shadow-md"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-indigo-600">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Register New Property</h2>

            <form onSubmit={handleRegisterProperty} className="space-y-4">
              {/* RESTORED INPUT FIELDS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location:</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="Enter full address"
                  required
                  disabled={isRegistering}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (km²) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="0.00"
                    required
                    disabled={isRegistering}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{listingType === 'sale' ? 'Sale Price' : 'Rent Offer'} (ETH) *</label>
                  <input
                    type="number"
                    step="0.001"
                    value={rentOffer}
                    onChange={(e) => setRentOffer(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="0.000"
                    required
                    disabled={isRegistering}
                  />
                </div>
                {/* Listing Type remains below */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Listing Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" value="rent" checked={listingType === "rent"} onChange={(e) => setListingType(e.target.value)} className="mr-2" disabled={isRegistering} />
                    <span className="flex items-center gap-2">🏠 For Rent</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" value="sale" checked={listingType === "sale"} onChange={(e) => setListingType(e.target.value)} className="mr-2" disabled={isRegistering} />
                    <span className="flex items-center gap-2">💰 For Sale</span>
                  </label>
                </div>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Image * (max 2MB)</label>
                <input
                  key={`image-${submissionKey}`} // FIX: Force remount to clear state
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 cursor-pointer"
                  disabled={isRegistering}
                />
                {preview && (
                  <img src={preview} alt="Property preview" className="mt-3 w-full h-48 object-cover rounded-lg shadow" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ownership Certificate * (max 2MB)</label>
                <input
                  key={`certificate-${submissionKey}`} // FIX: Force remount to clear state
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleCertificateUpload}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 cursor-pointer"
                  disabled={isRegistering}
                />
                {certificatePreview && (
                  <div className="mt-3 p-4 border rounded-lg bg-green-50 text-green-700 font-semibold shadow-inner">
                    <p className="text-sm">✅ Certificate uploaded successfully</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-3 rounded-lg font-semibold transition duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                {isRegistering ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Registering...
                  </>
                ) : (
                  'Register Property'
                )}
              </button>
            </form>
          </div>

          {/* Properties List */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-gray-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Your Properties ({myProperties.length})
            </h2>

            {myProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 text-gray-300">🏘️</div>
                <p className="text-gray-500 mb-4">No properties registered yet</p>
                <p className="text-sm text-gray-400">Register your first property using the form</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {myProperties.map((property) => (
                  <div
                    key={property.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition ${property.status === 'leased' ? 'bg-yellow-50 border-yellow-200' : ''
                      }`}
                  >
                    <div className="flex gap-4">
                      <img
                        src={getSafeImageUrl(property.imagePreview)}
                        alt={property.location}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{property.location}</h3>
                        <p className="text-sm text-gray-600">Area: {property.area} km²</p>
                        <p className="text-sm text-gray-600">
                          {property.listingType === 'sale' ? 'Sale Price' : 'Rent'}: {property.rentOffer} ETH
                        </p>

                        {/* Lease Information */}
                        {property.status === 'leased' && property.currentLease && (
                          // ... (Lease info JSX) ...
                          <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <p className="text-xs text-blue-700"><strong>Leased to:</strong> {property.leasedTo?.slice(0, 8)}...{property.leasedTo?.slice(-6)}</p>
                            <p className="text-xs text-blue-700"><strong>Lease ID:</strong> {property.leaseId || property.currentLease.leaseId}</p>
                            <p className="text-xs text-blue-700"><strong>Since:</strong> {new Date(property.leasedAt).toLocaleDateString()}</p>
                            <button
                              onClick={() => {
                                const leaseAgreement = property.currentLease?.leaseAgreementDocument;
                                if (leaseAgreement) {
                                  alert(`Lease Agreement:\n\n${leaseAgreement}`);
                                } else {
                                  alert("Lease agreement details not available.");
                                }
                              }}
                              className="mt-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                            >
                              View Lease Agreement
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${property.listingType === 'sale'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            {property.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${property.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'leased'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {property.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 flex justify-between items-center">
                          <span>ID: {property.id}</span>
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold"
                          >
                            Delete
                          </button>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordProperties;