// src/pages/TenantPropertySearch.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TenantPropertySearch = ({
  account,
  setAccount,
  setUserRole,
  properties = [],
  leaseRequests = [],
  setLeaseRequests,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [listingType, setListingType] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [offerAmounts, setOfferAmounts] = useState({});
  const [message, setMessage] = useState("");
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [isSearching, setIsSearching] = useState(false);


  const handleBack = () => {
    console.log("🔍 DEBUG handleBack called");

    // Check if user owns any properties (landlord) or not (tenant)
    const userOwnedProperties = properties.filter(p =>
      p.owner && account && p.owner.toLowerCase() === account.toLowerCase()
    );

    if (userOwnedProperties.length > 0) {
      console.log("✅ User is LANDLORD - navigating to /landlord");
      navigate("/landlord");
    } else {
      console.log("✅ User is TENANT - navigating to /tenant");
      navigate("/tenant");
    }
  };

  // Manual search function with button
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      const availableProperties = properties.filter(property =>
        property.status === "available" || property.status === undefined || property.status === null
      );
      setFilteredProperties(availableProperties);
      setMessage(`Showing all ${availableProperties.length} available properties`);
      return;
    }

    setIsSearching(true);

    const filtered = properties.filter((property) => {
      if (!property || typeof property !== 'object') {
        return false;
      }

      const isAvailable = property.status === "available" ||
        property.status === undefined ||
        property.status === null;

      if (!isAvailable) {
        return false;
      }

      const searchMatch = property.location &&
        property.location.toLowerCase().includes(searchTerm.toLowerCase());

      if (!searchMatch) {
        return false;
      }

      const typeMatch = listingType === "all" || property.listingType === listingType;
      if (!typeMatch) {
        return false;
      }

      const propertyPrice = parseFloat(property.rentOffer) || 0;
      const minPriceVal = parseFloat(minPrice) || 0;
      const maxPriceVal = parseFloat(maxPrice) || 9999999;

      const priceMatch = propertyPrice >= minPriceVal && propertyPrice <= maxPriceVal;
      if (!priceMatch) {
        return false;
      }

      return true;
    });

    setFilteredProperties(filtered);
    setMessage(filtered.length > 0
      ? `Found ${filtered.length} properties matching "${searchTerm}"`
      : `No properties found matching "${searchTerm}"`
    );
    setIsSearching(false);
  };

  // Automatic filtering when filters change
  useEffect(() => {
    if (!isSearching) {
      const filtered = properties.filter((property) => {
        if (!property || typeof property !== 'object') return false;

        const isAvailable = property.status === "available" ||
          property.status === undefined ||
          property.status === null;
        if (!isAvailable) return false;

        const searchMatch = !searchTerm ||
          (property.location &&
            property.location.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!searchMatch) return false;

        const typeMatch = listingType === "all" || property.listingType === listingType;
        if (!typeMatch) return false;

        const propertyPrice = parseFloat(property.rentOffer) || 0;
        const minPriceVal = parseFloat(minPrice) || 0;
        const maxPriceVal = parseFloat(maxPrice) || 9999999;

        return propertyPrice >= minPriceVal && propertyPrice <= maxPriceVal;
      });

      setFilteredProperties(filtered);
    }
  }, [properties, listingType, minPrice, maxPrice, searchTerm, isSearching]);

  // Lease request function
  const handleLeaseRequest = async (property) => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }

    const offer = offerAmounts[property.id];
    if (!offer || parseFloat(offer) <= 0) {
      alert("Please enter a valid offer amount!");
      return;
    }

    const existingRequest = leaseRequests.find(
      req => req.propertyId === property.id && req.tenant === account && req.status === "pending"
    );

    if (existingRequest) {
      alert("You already have a pending lease request for this property!");
      return;
    }

    try {
      const newRequest = {
        id: Date.now() + Math.random(),
        tenant: account,
        propertyId: property.id,
        property: property, // Store the property object for easier access later
        offer: parseFloat(offer).toFixed(3),
        status: "pending",
        createdAt: new Date().toISOString(),
        landlord: property.owner,
        tenantAddress: account,
        propertyLocation: property.location
      };

      console.log("📨 Creating lease request:", newRequest);

      setLeaseRequests(prev => {
        const updatedRequests = [...prev, newRequest];

        // Immediate local storage save (optional, but good for local dev consistency)
        try {
          localStorage.setItem("rentLedgerLeaseRequests", JSON.stringify(updatedRequests));
          console.log("💾 Immediately saved lease requests to localStorage:", updatedRequests.length);
        } catch (error) {
          console.error("Error saving lease requests:", error);
        }

        console.log("📊 Lease requests after update:", updatedRequests);
        return updatedRequests;
      });

      setOfferAmounts(prev => ({ ...prev, [property.id]: "" }));
      setMessage(`✅ Lease request sent for ${property.location}! Offer: ${offer} ETH. Landlord will review your request.`);
      setTimeout(() => setMessage(""), 5000);

      // Optional: force UI update after state update (often not needed due to React)
      setTimeout(() => {
        console.log("🔄 Forcing UI update after lease request");
      }, 100);

    } catch (error) {
      console.error("❌ Error creating lease request:", error);
      alert("Error sending lease request. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rentLedgerUserRole"); // Use correct localStorage key
    setUserRole(null);
    setAccount(null);
    navigate("/");
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setListingType("all");
    setMinPrice("");
    setMaxPrice("");
    setFilteredProperties(properties.filter(property =>
      property.status === "available" || property.status === undefined || property.status === null
    ));
    setMessage("Filters reset - showing all available properties");
  };

  // Get all unique locations for suggestions
  const allLocations = [...new Set(properties
    .map(p => p.location)
    .filter(Boolean)
  )];

  // Check if user has pending requests for each property
  const hasPendingRequest = (propertyId) => {
    return leaseRequests.some(
      req => req.propertyId === propertyId && req.tenant === account && req.status === "pending"
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="bg-blue-500 p-3 rounded-full">
              <span className="text-2xl text-white">🔍</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Property Search</h1>
              <p className="text-gray-600">Find your perfect property</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>


        {/* Debug Panel */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">🔧 DEBUG INFO</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Account:</strong> {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : "Not connected"}<br />
              <strong>User Properties:</strong> {properties.filter(p => p.owner && account && p.owner.toLowerCase() === account.toLowerCase()).length}<br />
              <strong>Total Properties:</strong> {properties.length}
            </div>
            <div>
              <strong>Back Navigation:</strong><br />
              {properties.filter(p => p.owner && account && p.owner.toLowerCase() === account.toLowerCase()).length > 0
                ? "Will go to LANDLORD dashboard"
                : "Will go to TENANT dashboard"}
            </div>
            <div>
              <button
                onClick={() => {
                  const owned = properties.filter(p => p.owner && account && p.owner.toLowerCase() === account.toLowerCase());
                  alert(`Debug Info:\n\nAccount: ${account}\nOwned Properties: ${owned.length}\nWill navigate to: ${owned.length > 0 ? 'LANDLORD' : 'TENANT'}`);
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs"
              >
                Show Debug Info
              </button>
            </div>
          </div>
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔍 Search Location
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g., New York, London, Tokyo..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  {isSearching ? "🔍 Searching..." : "🔍 Search"}
                </button>
              </div>
              {allLocations.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Available locations:</p>
                  <div className="flex flex-wrap gap-1">
                    {allLocations.slice(0, 5).map((location, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setSearchTerm(location);
                          setTimeout(handleSearch, 100);
                        }}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs transition"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">🏠 Type</label>
              <select
                value={listingType}
                onChange={(e) => setListingType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="rent">For Rent</option>
                <option value="sale">For Sale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">💰 Min Price (ETH)</label>
              <input
                type="number"
                step="0.001"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">💰 Max Price (ETH)</label>
              <input
                type="number"
                step="0.001"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="10.00"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              <span className="font-semibold">{filteredProperties.length}</span> of <span className="font-semibold">{properties.length}</span> properties match your search
              {message && <span className="ml-2 text-blue-600">• {message}</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Apply Filters
              </button>
              <button
                onClick={handleResetFilters}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🏘️ Available Properties ({filteredProperties.length})
          </h2>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          {filteredProperties.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4 text-gray-300">🏠</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No properties found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm
                  ? `No properties found matching "${searchTerm}"`
                  : "No properties available with current filters"
                }
              </p>

              {allLocations.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Try searching for:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {allLocations.slice(0, 6).map((location, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(location);
                          setTimeout(handleSearch, 100);
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleResetFilters}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Show All Properties
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => {
                const hasPending = hasPendingRequest(property.id);
                return (
                  <div
                    key={property.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200"
                  >
                    <div className="relative">
                      <img
                        src={property.imagePreview || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400"}
                        alt={property.location}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400";
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${property.listingType === 'sale'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                          {property.listingType === 'sale' ? '🏷️ For Sale' : '🏠 For Rent'}
                        </span>
                      </div>
                      {hasPending && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold border border-yellow-300">
                            ⏳ Request Pending
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">{property.location}</h3>

                        <div className="space-y-2 text-sm text-gray-600">
                          <p className="flex items-center gap-2">
                            📏 <span>Area: {property.area} km²</span>
                          </p>
                          <p className="flex items-center gap-2">
                            💰 <span>{
                              property.listingType === 'sale'
                                ? `Price: ${property.rentOffer} ETH`
                                : `Rent: ${property.rentOffer} ETH/month`
                            }</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {property.id} | Status: {property.status || 'available'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Offer (ETH) *
                          </label>
                          <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            placeholder={`e.g., ${property.rentOffer}`}
                            value={offerAmounts[property.id] || ""}
                            onChange={(e) =>
                              setOfferAmounts({
                                ...offerAmounts,
                                [property.id]: e.target.value,
                              })
                            }
                            disabled={hasPending}
                            className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${hasPending ? 'bg-gray-100 cursor-not-allowed' : ''
                              }`}
                            required
                          />
                        </div>
                        <button
                          onClick={() => handleLeaseRequest(property)}
                          disabled={!offerAmounts[property.id] || parseFloat(offerAmounts[property.id]) <= 0 || hasPending}
                          className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${hasPending
                            ? 'bg-gray-400 cursor-not-allowed text-white'
                            : !offerAmounts[property.id] || parseFloat(offerAmounts[property.id]) <= 0
                              ? 'bg-gray-400 cursor-not-allowed text-white'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            }`}
                        >
                          {hasPending ? (
                            <>⏳ Request Pending</>
                          ) : (
                            <>📨 Send Request</>
                          )}
                        </button>
                        {hasPending && (
                          <p className="text-xs text-yellow-600 text-center">
                            You have a pending request for this property
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantPropertySearch;