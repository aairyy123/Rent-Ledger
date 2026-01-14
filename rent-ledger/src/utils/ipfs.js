import axios from 'axios';

// --- PASTE YOUR PINATA JWT (API KEY) HERE ---
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxZDQyOWQ0OC1hOTBmLTQ5YmMtOGM5YS05OGMyMGVhYmE3ODgiLCJlbWFpbCI6InBuYXJjaGFuYTE5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxZjU5MTUyMWZhZDYwZDNiMTRiMCIsInNjb3BlZEtleVNlY3JldCI6IjAyZDRlMTllOGNiODZlMzYzZDc0ODZhNTg4NGRiZmFiM2NhYjgyN2NiMmU1ZWY1YTg0MDE3NzQ5OTZiNTRkMDYiLCJleHAiOjE3ODU0MDM1MDF9.pX-4nkAAZUEAo8uK-GHaF2rIgvXylv0hukS7bfeeYT4";

if (PINATA_JWT === "PASTE_YOUR_PINATA_JWT_TOKEN_HERE") {
  console.error("Missing Pinata JWT!");
  alert("IPFS uploader is not configured. Please add your Pinata JWT in src/utils/ipfs.js");
}

/**
 * Uploads a file to IPFS via Pinata
 * @param {File} file - The file to upload
 * @param {function} onProgress - (optional) callback (not supported by this SDK, but kept for compatibility)
 * @returns {string} The IPFS CID (e.g., "Qm...")
 */
export const uploadToIpfs = async (file, onProgress) => {
  if (!file) {
    throw new Error("No file selected.");
  }
  if (!PINATA_JWT) {
    throw new Error("Pinata JWT is not set.");
  }

  // Pinata SDK's upload method requires FormData
  const formData = new FormData();
  formData.append('file', file);
  
  // Optional: Add metadata to your file
  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', metadata);
  
  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', options);

  try {
    // We use axios to send the multipart/form-data
    const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      maxBodyLength: "Infinity", // or "Infinity"
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Authorization': `Bearer ${PINATA_JWT}`
      }
    });

    const cid = res.data.IpfsHash;
    console.log("Uploaded to Pinata with CID:", cid);
    
    // Call onProgress just to log, as we don't get live progress
    if (onProgress) onProgress({ stage: 'Uploaded', cid });
    
    return cid;

  } catch (error) {
    console.error("Pinata Upload Error:", error);
    throw new Error("Failed to upload file to Pinata.");
  }
};

/**
 * Creates a public gateway URL for an IPFS CID
 * @param {string} cid - The IPFS CID
 * @returns {string} A full URL (e.g., https://gateway.pinata.cloud/ipfs/Qm...)
 */
export const getIpfsUrl = (cid) => {
  if (!cid) return null;
  // Use Pinata's public gateway
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
};