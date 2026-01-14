// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Assume PropertyRegistry is deployed separately
interface IPropertyRegistry {
    function setLeased(uint256 _propertyId, address _tenant, uint256 _leaseId) external;
    function setUnleased(uint256 _propertyId) external; // Added for completeness
    function getProperty(uint256 _propertyId) external view 
        returns (address owner, string memory location, uint256 rentOffer, bool isLeased);
}

contract LeaseRegistry {
    enum LeaseStatus { Created, LandlordSigned, TenantSigned, Active, Terminated }

    struct Lease {
        uint256 propertyId;
        address landlord;
        address tenant;
        string ipfsHash; 
        uint256 rent; 
        uint256 deposit; 
        uint256 startDate; 
        uint256 endDate;    
        string propertyType; 
        bytes landlordSignature;
        bytes tenantSignature;
        LeaseStatus status;
        uint256 balance; // Tracks deposit/rent held for this lease
    }
    
    // NOTE: The previous errors were caused by the lack of a PropertyRegistry contract and 
    // a proper request-handling mechanism. I'm focusing on the main Lease flow now.

    mapping(uint256 => Lease) public leases;
    uint256 public leaseCount;
    address public propertyRegistryAddress;

    event LeaseCreated(uint256 leaseId, uint256 indexed propertyId, address indexed landlord, address indexed tenant);
    event LandlordSigned(uint256 leaseId, address landlord);
    event TenantSigned(uint256 leaseId, address tenant);
    event LeaseActivated(uint256 leaseId);
    event DepositReceived(uint256 leaseId, address from, uint256 amount);
    event DepositWithdrawn(uint256 leaseId, address to, uint256 amount);
    event LeaseTerminated(uint256 leaseId);

    constructor(address _propertyRegistryAddress) {
        require(_propertyRegistryAddress != address(0), "PropertyRegistry address cannot be zero");
        propertyRegistryAddress = _propertyRegistryAddress;
    }

    // Helper to get PropertyRegistry instance
    function getPropertyRegistry() internal view returns (IPropertyRegistry) {
        return IPropertyRegistry(propertyRegistryAddress);
    }

    // Function to initialize a new lease
    function createLease(
        uint256 _propertyId,
        address _tenant,
        string memory _ipfsHash,
        uint256 _rent,
        uint256 _deposit,
        uint256 _startDate,
        uint256 _endDate,
        string memory _propertyType
    ) external returns (uint256) {
        // Only the property owner can create a lease for their property
        (address propertyOwner, , , ) = getPropertyRegistry().getProperty(_propertyId);
        require(msg.sender == propertyOwner, "Only the property owner can create a lease");
        
        leaseCount++;
        uint256 newLeaseId = leaseCount;

        leases[newLeaseId] = Lease({
            propertyId: _propertyId,
            landlord: msg.sender,
            tenant: _tenant,
            ipfsHash: _ipfsHash,
            rent: _rent,
            deposit: _deposit,
            startDate: _startDate,
            endDate: _endDate,
            propertyType: _propertyType,
            landlordSignature: "",
            tenantSignature: "",
            status: LeaseStatus.Created,
            balance: 0
        });

        emit LeaseCreated(newLeaseId, _propertyId, msg.sender, _tenant);
        return newLeaseId;
    }

    // Landlord stores their signature on-chain
    function landlordSignLease(uint256 _leaseId, bytes memory _signature) external {
        Lease storage l = leases[_leaseId];
        require(msg.sender == l.landlord, "Only landlord can sign");
        require(l.status == LeaseStatus.Created, "Invalid lease state for signing");
        
        l.landlordSignature = _signature;
        l.status = LeaseStatus.LandlordSigned;
        emit LandlordSigned(_leaseId, msg.sender);
    }

    // Tenant stores their signature and pays the deposit
    function tenantSignLease(uint256 _leaseId, bytes memory _signature) external payable {
        Lease storage l = leases[_leaseId];
        require(msg.sender == l.tenant, "Only tenant can sign");
        require(l.status == LeaseStatus.LandlordSigned, "Lease not signed by landlord");
        
        // Require deposit if specified
        if (l.deposit > 0) {
            require(msg.value >= l.deposit, "Insufficient deposit sent");
            l.balance += msg.value; // Add funds to the lease balance
            emit DepositReceived(_leaseId, msg.sender, msg.value);
        } else {
            require(msg.value == 0, "No deposit expected");
        }

        l.tenantSignature = _signature;
        l.status = LeaseStatus.Active;

        // Call the PropertyRegistry to mark the property as leased
        IPropertyRegistry(propertyRegistryAddress).setLeased(l.propertyId, msg.sender, _leaseId);

        emit TenantSigned(_leaseId, msg.sender);
        emit LeaseActivated(_leaseId);
    }

    // Landlord or authorized party can withdraw deposit/funds
    function withdrawFunds(uint256 _leaseId, uint256 _amount) external {
        Lease storage l = leases[_leaseId];
        require(msg.sender == l.landlord, "Only landlord can withdraw");
        require(l.balance >= _amount, "Insufficient balance on lease");

        l.balance -= _amount;
        (bool success, ) = payable(l.landlord).call{value: _amount}("");
        require(success, "Withdrawal failed");

        emit DepositWithdrawn(_leaseId, l.landlord, _amount);
    }
}