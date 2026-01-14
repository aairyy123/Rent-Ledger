// src/components/DigitalSignature.js
import React, { useState } from 'react';

const DigitalSignature = ({ account, onSign, role, document }) => {
  const [isSigned, setIsSigned] = useState(false);
  const [signature, setSignature] = useState('');

  const handleSign = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }

    const timestamp = new Date().toISOString();
    const message = `I, ${role === 'landlord' ? 'Landlord' : 'Tenant'} (${account}), agree to the lease agreement for ${document.propertyLocation} on ${timestamp}`;

    // Simulated Ethers signature
    const simulatedSignature = `0x${btoa(message).slice(0, 40)}...`;

    setSignature(simulatedSignature);
    setIsSigned(true);

    onSign({
      signer: account,
      role: role,
      signature: simulatedSignature,
      message: message,
      timestamp: timestamp
    });

    alert(`✅ ${role === 'landlord' ? 'Landlord' : 'Tenant'} signature added!`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800">
          {role === 'landlord' ? '🏠 Landlord Signature' : '👤 Tenant Signature'}
        </h4>
        {isSigned ? (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
            ✅ Signed
          </span>
        ) : (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
            ⏳ Pending
          </span>
        )}
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <p>Signer: {account?.slice(0, 8)}...{account?.slice(-6)}</p>
        <p>Property: {document.propertyLocation}</p>
      </div>

      {isSigned ? (
        <div className="bg-green-50 border border-green-200 rounded p-3">
          <p className="text-green-800 text-sm">
            <strong>Signature:</strong> {signature}
          </p>
          <p className="text-green-700 text-xs mt-1">
            Signed on: {new Date().toLocaleString()}
          </p>
        </div>
      ) : (
        <button
          onClick={handleSign}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition"
        >
          ✍️ Sign as {role === 'landlord' ? 'Landlord' : 'Tenant'}
        </button>
      )}
    </div>
  );
};

export default DigitalSignature;