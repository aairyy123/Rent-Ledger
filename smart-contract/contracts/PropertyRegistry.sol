// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// This contract manages property registration and ownership.
contract PropertyRegistry {
    // Defines a Property token structure
    struct Property {
        address payable owner;
        string location;
        uint256 rentOffer; // In Wei
        string propertyHash; // IPFS hash for full documents/images
        bool isRegistered;
        bool isLeased;
    }

    // Mapping of unique property ID to the Property details
    mapping(uint256 => Property) public properties;
    uint256 public propertyCount;

    // Mapping property owner to the count of properties they own
    mapping(address => uint256) public ownerPropertyCount;

    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, string location, uint256 rentOffer);
    event PropertyLeased(uint256 indexed propertyId, address indexed tenant, uint256 leaseId);
    event PropertyUnleased(uint256 indexed propertyId);

    // Modifier to restrict access to the property owner
    modifier onlyOwner(uint256 _propertyId) {
        require(properties[_propertyId].owner == msg.sender, "Caller is not the property owner");
        _;
    }

    // Function to register a new property
    function registerProperty(
        string memory _location,
        uint256 _rentOffer,
        string memory _propertyHash
    ) external returns (uint256) {
        propertyCount++;
        uint256 newId = propertyCount;

        properties[newId] = Property({
            owner: payable(msg.sender),
            location: _location,
            rentOffer: _rentOffer,
            propertyHash: _propertyHash,
            isRegistered: true,
            isLeased: false
        });

        ownerPropertyCount[msg.sender]++;

        emit PropertyRegistered(newId, msg.sender, _location, _rentOffer);
        return newId;
    }

    // Function called by LeaseRegistry to mark a property as leased
    function setLeased(uint256 _propertyId, address _tenant, uint256 _leaseId) external onlyOwner(_propertyId) {
        require(properties[_propertyId].isRegistered, "Property must be registered");
        require(!properties[_propertyId].isLeased, "Property is already leased");
        
        properties[_propertyId].isLeased = true;

        emit PropertyLeased(_propertyId, _tenant, _leaseId);
    }

    // Function to get basic property details
    function getProperty(uint256 _propertyId) 
        external 
        view 
        returns (address owner, string memory location, uint256 rentOffer, bool isLeased) 
    {
        Property storage p = properties[_propertyId];
        return (p.owner, p.location, p.rentOffer, p.isLeased);
    }
}