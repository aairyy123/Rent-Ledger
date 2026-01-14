// src/components/WalletConnect.js
import React from "react";
import { ethers } from "ethers";

export default function WalletConnect({ account, setAccount }) {
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected! Please install MetaMask.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Wallet connection failed. Please try again.");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  return (
    <div className="text-center">
      {account ? (
        <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 inline-block border border-white/30">
          <p className="text-lg mb-3 font-semibold text-white">Wallet Connected</p>
          <p className="font-mono bg-indigo-700 bg-opacity-80 text-white px-4 py-2 rounded-lg mb-4 break-all shadow-md">
            {account}
          </p>
          <button
            onClick={disconnectWallet}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-lg"
          >
            Disconnect Wallet
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-white hover:bg-gray-100 text-indigo-700 px-8 py-4 rounded-xl text-xl font-bold transition-all duration-300 hover:scale-[1.05] shadow-2xl shadow-indigo-600/50"
        >
          🔗 Connect MetaMask Wallet
        </button>
      )}
    </div>
  );
}