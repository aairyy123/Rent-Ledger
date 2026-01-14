import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import PropertyRegistryArtifact from '../contract_artifacts/PropertyRegistry.json'; 
import LeaseRegistryArtifact from '../contract_artifacts/LeaseRegistry.json';

const PROPERTY_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
const LEASE_REGISTRY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// 1. Create the Context
const Web3Context = createContext();

// Custom hook to use the Web3 context easily
export const useWeb3 = () => useContext(Web3Context);

// 2. Context Provider Component
export const Web3Provider = ({ children, account, setAccount }) => {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [propertyRegistryContract, setPropertyRegistryContract] = useState(null);
    const [leaseRegistryContract, setLeaseRegistryContract] = useState(null);
    const [isWeb3Ready, setIsWeb3Ready] = useState(false);

    // Effect to initialize Web3 environment when the component mounts
    useEffect(() => {
        const initializeWeb3 = async () => {
            if (window.ethereum) {
                try {
                    // Ethers v6 Provider initialization
                    const ethProvider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(ethProvider);

                    // Initialize contracts with a generic provider
                    const propertyContract = new ethers.Contract(
                        PROPERTY_REGISTRY_ADDRESS,
                        PropertyRegistryArtifact.abi,
                        ethProvider
                    );
                    const leaseContract = new ethers.Contract(
                        LEASE_REGISTRY_ADDRESS,
                        LeaseRegistryArtifact.abi,
                        ethProvider
                    );

                    setPropertyRegistryContract(propertyContract);
                    setLeaseRegistryContract(leaseContract);
                    setIsWeb3Ready(true);
                    
                    // Attempt to connect immediately if account is already set or on initial load
                    if (account) {
                        const ethSigner = await ethProvider.getSigner();
                        setSigner(ethSigner);
                        // Re-initialize contracts with the signer for transactions
                        setPropertyRegistryContract(propertyContract.connect(ethSigner));
                        setLeaseRegistryContract(leaseContract.connect(ethSigner));
                    }

                    console.log("Web3 Initialized: Contracts ready.");

                } catch (error) {
                    console.error("Error initializing Web3 or connecting contracts:", error);
                }
            } else {
                console.warn("MetaMask not detected. Please install a Web3 wallet.");
                setIsWeb3Ready(true);
            }
        };

        initializeWeb3();
    }, []); 

    // Effect to update the Signer/Contracts when the account changes
    useEffect(() => {
        const updateSigner = async () => {
            if (provider && isWeb3Ready) {
                if (account) {
                    try {
                        const ethSigner = await provider.getSigner(account);
                        setSigner(ethSigner);
                        
                        // Connect contracts to the Signer for transaction capabilities
                        setPropertyRegistryContract(prev => prev.connect(ethSigner));
                        setLeaseRegistryContract(prev => prev.connect(ethSigner));

                        console.log(`Web3 Signer connected: ${account}`);
                    } catch (error) {
                        console.error("Failed to get Signer or connect contracts:", error);
                        setSigner(null);
                    }
                } else {
                    // Disconnected or no account
                    setSigner(null);
                    // Revert contracts to a read-only provider connection
                    if (propertyRegistryContract) {
                        setPropertyRegistryContract(prev => prev.connect(provider));
                    }
                    if (leaseRegistryContract) {
                        setLeaseRegistryContract(prev => prev.connect(provider));
                    }
                    console.log("Web3 Signer disconnected.");
                }
            }
        };

        updateSigner();
    }, [account, provider, isWeb3Ready]); 

    // The value provided to components that consume this context
    const contextValue = {
        provider,
        signer,
        propertyRegistryContract,
        leaseRegistryContract,
        isWeb3Ready,
        ethers, 
        PropertyRegistryABI: PropertyRegistryArtifact.abi,
        LeaseRegistryABI: LeaseRegistryArtifact.abi,
    };

    return (
        <Web3Context.Provider value={contextValue}>
            {children}
        </Web3Context.Provider>
    );
};