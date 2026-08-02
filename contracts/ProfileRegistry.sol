// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ProfileRegistry
/// @notice A minimal on-chain identity layer for PetitionBase.
///         Any wallet can register a public username and bio, which the
///         frontend uses to display human-readable profiles instead of
///         raw hex addresses. One profile per wallet; fully self-sovereign.
contract ProfileRegistry {

    struct Profile {
        string username;
        string bio;
        uint256 updatedAt;
        bool exists;
    }

    // wallet => Profile
    mapping(address => Profile) private profiles;

    // lowercase username hash => wallet (enforces uniqueness)
    mapping(bytes32 => address) private usernameOwner;

    event ProfileSet(
        address indexed wallet,
        string username,
        string bio
    );

    event ProfileCleared(address indexed wallet);

    /// @notice Create or update your own profile.
    /// @param _username Public handle (1-24 chars, unique, case-insensitive)
    /// @param _bio Short bio (max 160 chars)
    function setProfile(string calldata _username, string calldata _bio) external {
        require(bytes(_username).length >= 1, "Username cannot be empty");
        require(bytes(_username).length <= 24, "Username too long (max 24 chars)");
        require(bytes(_bio).length <= 160, "Bio too long (max 160 chars)");

        bytes32 key = _usernameKey(_username);
        address existing = usernameOwner[key];
        require(
            existing == address(0) || existing == msg.sender,
            "Username already taken"
        );

        // Free up the old username if the user is changing it.
        if (profiles[msg.sender].exists) {
            bytes32 oldKey = _usernameKey(profiles[msg.sender].username);
            if (oldKey != key && usernameOwner[oldKey] == msg.sender) {
                delete usernameOwner[oldKey];
            }
        }

        usernameOwner[key] = msg.sender;
        profiles[msg.sender] = Profile({
            username: _username,
            bio: _bio,
            updatedAt: block.timestamp,
            exists: true
        });

        emit ProfileSet(msg.sender, _username, _bio);
    }

    /// @notice Remove your own profile and release your username.
    function clearProfile() external {
        require(profiles[msg.sender].exists, "No profile to clear");
        bytes32 oldKey = _usernameKey(profiles[msg.sender].username);
        if (usernameOwner[oldKey] == msg.sender) {
            delete usernameOwner[oldKey];
        }
        delete profiles[msg.sender];
        emit ProfileCleared(msg.sender);
    }

    /// @notice Get the profile for a wallet. Returns empty strings if none.
    function getProfile(address _wallet)
        external
        view
        returns (string memory username, string memory bio, uint256 updatedAt, bool exists)
    {
        Profile memory p = profiles[_wallet];
        return (p.username, p.bio, p.updatedAt, p.exists);
    }

    /// @notice Check whether a username is available.
    function isUsernameAvailable(string calldata _username) external view returns (bool) {
        return usernameOwner[_usernameKey(_username)] == address(0);
    }

    /// @dev Case-insensitive uniqueness key (lowercases ASCII A-Z).
    function _usernameKey(string memory _username) internal pure returns (bytes32) {
        bytes memory b = bytes(_username);
        for (uint256 i = 0; i < b.length; i++) {
            bytes1 c = b[i];
            if (c >= 0x41 && c <= 0x5A) {
                b[i] = bytes1(uint8(c) + 32);
            }
        }
        return keccak256(b);
    }
}
