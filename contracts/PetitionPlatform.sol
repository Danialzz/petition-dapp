// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title PetitionPlatform
/// @notice A decentralized petition platform on Base network.
///         Anyone can create a petition. Anyone can sign open petitions.
///         The platform owner can remove ANY petition that violates rules.
///         A petition's creator can also remove their OWN petition at any time.
contract PetitionPlatform {

    // ─────────────────────────────────────────
    // Structs
    // ─────────────────────────────────────────

    struct Petition {
        uint256 id;
        address creator;
        string title;
        string description;
        string category;
        uint256 deadline;       // Unix timestamp when signing closes
        uint256 signatureCount;
        bool active;            // false = removed (by owner or creator)
        uint256 createdAt;
    }

    // ─────────────────────────────────────────
    // State
    // ─────────────────────────────────────────

    address public owner;
    uint256 public petitionCount;

    // petitionId => Petition
    mapping(uint256 => Petition) public petitions;

    // petitionId => signerAddress => hasSigned
    mapping(uint256 => mapping(address => bool)) public hasSigned;

    // petitionId => list of signer addresses
    mapping(uint256 => address[]) private signers;

    // ─────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────

    event PetitionCreated(
        uint256 indexed id,
        address indexed creator,
        string title,
        string category,
        uint256 deadline
    );

    event PetitionSigned(
        uint256 indexed id,
        address indexed signer,
        uint256 newCount
    );

    event PetitionRemoved(
        uint256 indexed id,
        address indexed removedBy,
        string reason
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ─────────────────────────────────────────
    // Modifiers
    // ─────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the platform owner");
        _;
    }

    modifier petitionExists(uint256 _id) {
        require(_id > 0 && _id <= petitionCount, "Petition does not exist");
        _;
    }

    modifier petitionIsActive(uint256 _id) {
        require(petitions[_id].active, "Petition has been removed");
        require(block.timestamp <= petitions[_id].deadline, "Petition deadline has passed");
        _;
    }

    // ─────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─────────────────────────────────────────
    // Core Functions
    // ─────────────────────────────────────────

    /// @notice Create a new petition
    /// @param _title Short title for the petition
    /// @param _description Full description of what you're petitioning for
    /// @param _category Category label (e.g. "Environment", "Human Rights")
    /// @param _durationInDays How many days the petition stays open
    function createPetition(
        string calldata _title,
        string calldata _description,
        string calldata _category,
        uint256 _durationInDays
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_title).length <= 100, "Title too long (max 100 chars)");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_description).length <= 1000, "Description too long (max 1000 chars)");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(_durationInDays >= 1, "Duration must be at least 1 day");
        require(_durationInDays <= 365, "Duration cannot exceed 365 days");

        petitionCount++;
        uint256 newId = petitionCount;
        uint256 deadline = block.timestamp + (_durationInDays * 1 days);

        petitions[newId] = Petition({
            id: newId,
            creator: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            deadline: deadline,
            signatureCount: 0,
            active: true,
            createdAt: block.timestamp
        });

        emit PetitionCreated(newId, msg.sender, _title, _category, deadline);
        return newId;
    }

    /// @notice Sign a petition
    /// @param _id The petition ID to sign
    function signPetition(uint256 _id)
        external
        petitionExists(_id)
        petitionIsActive(_id)
    {
        require(!hasSigned[_id][msg.sender], "You already signed this petition");

        hasSigned[_id][msg.sender] = true;
        signers[_id].push(msg.sender);
        petitions[_id].signatureCount++;

        emit PetitionSigned(_id, msg.sender, petitions[_id].signatureCount);
    }

    /// @notice Remove a petition. Callable by the platform owner (any petition,
    ///         e.g. for rule violations) OR by the petition's own creator
    ///         (their own petition only, e.g. they no longer want it listed).
    /// @param _id The petition ID to remove
    /// @param _reason The reason for removal
    function removePetition(uint256 _id, string calldata _reason)
        external
        petitionExists(_id)
    {
        require(petitions[_id].active, "Petition already removed");
        require(bytes(_reason).length > 0, "Must provide a reason");
        require(
            msg.sender == owner || msg.sender == petitions[_id].creator,
            "Only the platform owner or the petition's creator can remove it"
        );

        petitions[_id].active = false;
        emit PetitionRemoved(_id, msg.sender, _reason);
    }

    /// @notice Transfer platform ownership to a new address
    /// @param _newOwner Address of the new owner
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }

    // ─────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────

    /// @notice Get full details of a petition
    function getPetition(uint256 _id)
        external
        view
        petitionExists(_id)
        returns (Petition memory)
    {
        return petitions[_id];
    }

    /// @notice Get list of all signer addresses for a petition
    function getSigners(uint256 _id)
        external
        view
        petitionExists(_id)
        returns (address[] memory)
    {
        return signers[_id];
    }

    /// @notice Check if a specific wallet has signed a petition
    function hasWalletSigned(uint256 _id, address _wallet)
        external
        view
        returns (bool)
    {
        return hasSigned[_id][_wallet];
    }

    /// @notice Check if a petition is still open for signatures
    function isPetitionOpen(uint256 _id)
        external
        view
        petitionExists(_id)
        returns (bool)
    {
        return petitions[_id].active && block.timestamp <= petitions[_id].deadline;
    }

    /// @notice Get all petition IDs (active and inactive)
    function getAllPetitionIds() external view returns (uint256[] memory) {
        uint256[] memory ids = new uint256[](petitionCount);
        for (uint256 i = 0; i < petitionCount; i++) {
            ids[i] = i + 1;
        }
        return ids;
    }

    /// @notice Get total number of petitions created
    function getTotalPetitions() external view returns (uint256) {
        return petitionCount;
    }
}
