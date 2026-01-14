// src/pages/PropertyRegistration.jsx (FIXED)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { convertFileToBase64, getSafeImageUrl } from "../utils/imageUtils";

export default function PropertyRegistration({
  account,
  properties,
  setProperties,
}) {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [rentOffer, setRentOffer] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      try {
        const base64 = await convertFileToBase64(file);
        setPreview(base64);
      } catch (error) {
        console.error("Error converting image:", error);
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleRegister = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!location || !area || !rentOffer || !image) {
      alert("Please fill in all fields and upload an image!");
      return;
    }

    try {
      let imageBase64 = preview;
      
      if (preview && preview.startsWith('blob:')) {
        imageBase64 = await convertFileToBase64(image);
      }

      const newProperty = {
        id: Date.now(),
        location: location.trim(),
        area: area.toString(),
        rentOffer: rentOffer.toString(),
        listingType: "rent",
        imagePreview: imageBase64 || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400",
        owner: account,
        status: "available",
        createdAt: new Date().toISOString(),
      };

      // Save to localStorage and update state
      const updatedProperties = [...properties, newProperty];
      setProperties(updatedProperties);
      
      console.log("✅ Property saved:", newProperty);
      console.log("📊 Total properties now:", updatedProperties.length);

      alert("✅ Property registered successfully!");

      // Reset form
      setLocation("");
      setArea("");
      setRentOffer("");
      setImage(null);
      setPreview(null);

    } catch (error) {
      console.error("Error registering property:", error);
      alert("Error registering property. Please try again.");
    }
  };

  const myProperties = properties.filter(
    (p) => p.owner && account && p.owner.toLowerCase() === account.toLowerCase()
  );

  const handleBack = () => {
    navigate("/landlord");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex flex-col items-center text-white p-6">
      <div className="w-full max-w-4xl bg-white text-gray-900 rounded-2xl shadow-lg p-8 mt-10">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          🏡 Register Your Property
        </h1>

        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-semibold mb-2">Location:</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="e.g., New York, London, Tokyo"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Area (sq. km²):</label>
            <input
              type="number"
              step="0.01"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="e.g., 1.5"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Rent Offer (ETH):</label>
            <input
              type="number"
              step="0.001"
              value={rentOffer}
              onChange={(e) => setRentOffer(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="e.g., 2.5"
              required
            />
          </div>

          <div>
            <label className="block font-semibold mb-2">Property Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="mb-6">
            <p className="font-semibold mb-2 text-indigo-700">Image Preview:</p>
            <img
              src={getSafeImageUrl(preview)}
              alt="Property Preview"
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap justify-between gap-4">
          <button
            onClick={handleRegister}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Register Property
          </button>

          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            ⬅️ Back to Dashboard
          </button>
        </div>

        {/* Debug Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Debug Info:</strong> Total properties in system: {properties.length} | 
            Your properties: {myProperties.length}
          </p>
        </div>
      </div>

      {/* List of Registered Properties */}
      <div className="w-full max-w-4xl mt-10">
        <h2 className="text-2xl font-bold mb-4">📋 Your Registered Properties ({myProperties.length})</h2>

        {myProperties.length === 0 ? (
          <p className="text-gray-200 text-center">No properties registered yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myProperties.map((p) => (
              <div
                key={p.id}
                className="bg-white text-gray-900 rounded-xl shadow-md overflow-hidden"
              >
                <img
                  src={getSafeImageUrl(p.imagePreview || p.image)}
                  alt="Property"
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <p className="font-bold text-lg">{p.location}</p>
                  <p>Area: {p.area} km²</p>
                  <p>Rent: {p.rentOffer} ETH</p>
                  <p>Type: {p.listingType === 'sale' ? 'For Sale' : 'For Rent'}</p>
                  <p className="text-sm text-gray-500">
                    Registered: {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}