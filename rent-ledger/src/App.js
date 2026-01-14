import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";

// Components & Context Imports
// IMPORTANT: Ensure Web3Provider is implemented correctly in this file:
import { Web3Provider } from "./context/Web3Context";

// Page Imports
import Home from "./pages/Home";
import LandlordDashboard from "./pages/LandlordDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import PropertyRegistration from "./pages/PropertyRegistration";
import LandlordProperties from "./pages/LandlordProperties";
import TenantPropertySearch from "./pages/TenantPropertySearch";
import CreateLease from "./pages/CreateLease";
import TenantLeases from "./pages/TenantLeases";
import LeaseSearch from "./pages/LeaseSearch";

// Enhanced sample data
const SAMPLE_PROPERTIES = [
  {
    id: 1,
    location: "New York Downtown Apartment",
    area: "1.2",
    rentOffer: "2.5",
    listingType: "rent",
    owner: "0x742d35Cc6634C0532925a3b8D12345678901234",
    imagePreview: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400",
    status: "available",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    location: "London Luxury Villa",
    area: "3.5",
    rentOffer: "5.8",
    listingType: "rent",
    owner: "0x842d35Cc6634C0532925a3b8E12345678901234",
    imagePreview: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400",
    status: "available",
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    location: "Tokyo Modern Studio",
    area: "0.8",
    rentOffer: "1.2",
    listingType: "rent",
    owner: "0x942d35Cc6634C0532925a3b8F12345678901234",
    imagePreview: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400",
    status: "available",
    createdAt: new Date().toISOString()
  }
];

// --- App Component ---
function App() {
  // Initialize state with proper localStorage loading
  const [account, setAccountState] = useState(() => {
    try {
      return localStorage.getItem("rentLedgerAccount") || null;
    } catch (error) {
      console.error("Error loading account:", error);
      return null;
    }
  });

  const [userRole, setUserRoleState] = useState(() => {
    try {
      return localStorage.getItem("rentLedgerUserRole") || null;
    } catch (error) {
      console.error("Error loading user role:", error);
      return null;
    }
  });

  // Enhanced property management
  const [properties, setProperties] = useState(() => {
    try {
      const saved = localStorage.getItem("rentLedgerProperties");
      if (saved) {
        const parsed = JSON.parse(saved);
        // console.log("📁 Loaded properties:", parsed.length);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    }
    return [];
  });

  const [leaseRequests, setLeaseRequests] = useState(() => {
    try {
      const saved = localStorage.getItem("rentLedgerLeaseRequests");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading lease requests:", error);
      return [];
    }
  });

  const [leases, setLeases] = useState(() => {
    try {
      const saved = localStorage.getItem("rentLedgerLeases");
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Error loading leases:", error);
      return [];
    }
  });

  // Enhanced state setters
  const setAccount = (newAccount) => {
    setAccountState(newAccount);
    if (newAccount) {
      localStorage.setItem("rentLedgerAccount", newAccount);
    } else {
      localStorage.removeItem("rentLedgerAccount");
    }
  };

  const setUserRole = (newRole) => {
    setUserRoleState(newRole);
    if (newRole) {
      localStorage.setItem("rentLedgerUserRole", newRole);
    } else {
      localStorage.removeItem("rentLedgerUserRole");
    }
  };

  // --- Local Storage Persistence Effects (Optimized for Quota) ---
  useEffect(() => {
    try {
      const propertiesString = JSON.stringify(properties);
      if (propertiesString.length > 5000000) {
        console.warn("⚠️ Properties data too large, not saving to localStorage");
        return;
      }
      localStorage.setItem("rentLedgerProperties", propertiesString);
      // console.log("💾 Saved properties:", properties.length);
    } catch (error) {
      console.error("❌ Error saving properties:", error);
      if (error.name === 'QuotaExceededError') {
        console.warn("⚠️ localStorage quota exceeded for properties");
      }
    }
  }, [properties]);

  useEffect(() => {
    try {
      const requestsString = JSON.stringify(leaseRequests);
      if (requestsString.length > 1000000) {
        console.warn("⚠️ Lease requests data too large, not saving to localStorage");
        return;
      }
      localStorage.setItem("rentLedgerLeaseRequests", requestsString);
      // console.log("💾 Saved lease requests:", leaseRequests.length);
    } catch (error) {
      console.error("❌ Error saving lease requests:", error);
      if (error.name === 'QuotaExceededError') {
        console.warn("⚠️ localStorage quota exceeded for lease requests");
      }
    }
  }, [leaseRequests]);

  useEffect(() => {
    try {
      const leasesString = JSON.stringify(leases);
      if (leasesString.length > 1000000) {
        console.warn("⚠️ Leases data too large, not saving to localStorage");
        return;
      }
      localStorage.setItem("rentLedgerLeases", leasesString);
      // console.log("💾 Saved leases:", leases.length);
    } catch (error) {
      console.error("❌ Error saving leases:", error);
      if (error.name === 'QuotaExceededError') {
        console.warn("⚠️ localStorage quota exceeded for leases");
      }
    }
  }, [leases]);

  // --- Data Management Functions ---
  const addSampleData = () => {
    setProperties(SAMPLE_PROPERTIES);
    alert("✅ Sample properties added! Search for 'New York', 'London', or 'Tokyo'");
  };

  const resetAllData = () => {
    if (window.confirm("Clear ALL data including properties, leases, and account?")) {
      setProperties([]);
      setLeaseRequests([]);
      setLeases([]);
      setAccount(null);
      setUserRole(null);
      localStorage.clear();
      alert("🗑️ All data cleared!");
    }
  };

  const restoreData = () => {
    if (window.confirm("Restore sample data and keep existing data?")) {
      setProperties(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newProperties = SAMPLE_PROPERTIES.filter(p => !existingIds.has(p.id));
        return [...prev, ...newProperties];
      });
      alert("✅ Data restored! Existing data preserved.");
    }
  };

  const debugLeaseFlow = () => {
    console.log("🔍 DEBUG Lease Flow:");
    console.log("Lease Requests:", leaseRequests);
    console.log("Properties:", properties);
    console.log("Account:", account);
    const savedRequests = localStorage.getItem("rentLedgerLeaseRequests");
    console.log("LocalStorage Lease Requests:", savedRequests ? JSON.parse(savedRequests) : "None");
    alert(`Lease Flow Debug:\n\nRequests: ${leaseRequests.length}\nProperties: ${properties.length}\nAccount: ${account ? "Connected" : "Not Connected"}\n\nCheck console for details.`);
  };
  // -------------------------------

  return (
    // Wrap the entire application with Web3Provider to pass account/web3 objects down
    <Web3Provider account={account} setAccount={setAccount}>
      <BrowserRouter>
        {/* Debug Controls */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 bg-white p-3 rounded-lg shadow-lg border">
          <div className="text-xs font-semibold text-gray-600 mb-1">Data Controls</div>

          <button onClick={addSampleData} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm">
            🧪 Add Samples
          </button>

          <button onClick={restoreData} className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm">
            🔄 Restore Data
          </button>

          <button onClick={resetAllData} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm">
            🗑️ Clear All
          </button>

          <button onClick={debugLeaseFlow} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm">
            🔍 Debug Lease Flow
          </button>

          {/* Stats */}
          <div className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded">
            <div>🏠 Props: {properties.length}</div>
            <div>📄 Reqs: {leaseRequests.length}</div>
            <div>📝 Leases: {leases.length}</div>
          </div>
        </div>

        <MainRoutes
          account={account}
          setAccount={setAccount}
          userRole={userRole}
          setUserRole={setUserRole}
          properties={properties}
          setProperties={setProperties}
          leaseRequests={leaseRequests}
          setLeaseRequests={setLeaseRequests}
          leases={leases}
          setLeases={setLeases}
        />
      </BrowserRouter>
    </Web3Provider>
  );
}

// --- MainRoutes Component ---
function MainRoutes({
  account,
  setAccount,
  userRole,
  setUserRole,
  properties,
  setProperties,
  leaseRequests,
  setLeaseRequests,
  leases,
  setLeases
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-redirect based on user role
  useEffect(() => {
    if (location.pathname === '/' && userRole) {
      navigate(`/${userRole}`);
    }
  }, [userRole, navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={
        <Home
          account={account}
          setAccount={setAccount}
          setUserRole={setUserRole}
        />
      } />

      {/* Landlord Routes */}
      <Route path="/landlord" element={
        <LandlordDashboard
          account={account}
          setAccount={setAccount}
          setUserRole={setUserRole}
          properties={properties}
          setProperties={setProperties}
          leaseRequests={leaseRequests}
          setLeaseRequests={setLeaseRequests}
        />
      } />

      <Route path="/landlord/properties" element={
        <LandlordProperties
          account={account}
          setAccount={setAccount}
          setUserRole={setUserRole}
          properties={properties}
          setProperties={setProperties}
        />
      } />

      <Route path="/property-registration" element={
        <PropertyRegistration
          account={account}
          properties={properties}
          setProperties={setProperties}
        />
      } />

      {/* Tenant Routes */}
      <Route path="/tenant" element={
        <TenantDashboard
          account={account}
          setAccount={setAccount}
          setUserRole={setUserRole}
          properties={properties}
          leaseRequests={leaseRequests}
          leases={leases}
        />
      } />

      <Route path="/tenant/search" element={
        <TenantPropertySearch
          account={account}
          setAccount={setAccount}
          setUserRole={setUserRole}
          properties={properties}
          leaseRequests={leaseRequests}
          setLeaseRequests={setLeaseRequests}
        />
      } />

      {/* Create Lease Route */}
      <Route path="/create-lease/:propertyId" element={
        <CreateLease
          account={account}
          properties={properties}
          setProperties={setProperties}
          leaseRequests={leaseRequests}
          setLeaseRequests={setLeaseRequests}
          setLeases={setLeases}
        />
      } />

      <Route path="/tenant/leases" element={
        <TenantLeases
          account={account}
          leases={leases}
          properties={properties}
        />
      } />

      <Route path="/lease-search" element={
        <LeaseSearch
          leases={leases}
          properties={properties}
        />
      } />

      {/* Fallback route */}
      <Route path="*" element={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Go Home
            </button>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default App;