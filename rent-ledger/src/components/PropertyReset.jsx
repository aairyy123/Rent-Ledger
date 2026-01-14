// src/components/PropertyReset.jsx
import React from 'react';

const PropertyReset = ({ setProperties }) => {
  const resetProperties = () => {
    const sampleProperties = [
      {
        id: 1,
        location: "New York Downtown Apartment",
        area: "1.2",
        rentOffer: "2.5",
        listingType: "rent",
        owner: "0x742d35Cc6634C0532925a3b8D",
        imagePreview: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
        status: "available",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        location: "London Luxury Villa", 
        area: "3.5",
        rentOffer: "5.8",
        listingType: "sale",
        owner: "0x842d35Cc6634C0532925a3b8E",
        imagePreview: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
        status: "available",
        createdAt: new Date().toISOString()
      }
    ];
    
    setProperties(sampleProperties);
    localStorage.setItem("rentLedgerProperties", JSON.stringify(sampleProperties));
    alert("✅ Sample properties reset! You can now search for 'New York' or 'London'");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={resetProperties}
        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg transition"
      >
        🔄 Reset Properties
      </button>
    </div>
  );
};

export default PropertyReset;