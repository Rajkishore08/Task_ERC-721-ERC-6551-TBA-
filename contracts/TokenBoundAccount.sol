// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/// @title TokenBoundAccount - Minimal cloneable account bound to an ERC721 token
/// @notice Each clone is initialized once with its token binding and metadata pointers.
contract TokenBoundAccount {
    // immutable-like storage once initialized
    address public registry; // creator registry
    address public nft;
    uint256 public tokenId;
    address public owner; // token owner at init; optional use
    address public oracle; // trusted IoT gateway to push readings

    // Off-chain data anchor (e.g., IPFS CID) for static intake/warehouse metadata
    string public metadataCid;

    bool public initialized;

    struct Reading {
        uint64 timestamp;
        int32 temperatureC; // e.g., multiplied by 100 if needed
        uint32 moisture; // basis points (0-10000) or raw percentile (0-100)
    }

    // dateKey => reading; dateKey can be yyyyMMdd as uint32
    mapping(uint32 => Reading[2]) private dayReadings; // up to two readings per day
    mapping(uint32 => uint8) public dayCount; // how many readings stored for the day

    event Initialized(address indexed registry, address indexed nft, uint256 indexed tokenId, address oracle, string metadataCid);
    event OracleUpdated(address indexed oracle);
    event ReadingStored(uint32 indexed dateKey, uint8 indexed index, Reading reading);

    modifier onlyRegistry() {
        require(msg.sender == registry, "Not registry");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == oracle, "Not oracle");
        _;
    }

    function initialize(
        address registry_,
        address nft_,
        uint256 tokenId_,
        address oracle_,
        string calldata metadataCid_
    ) external {
        require(!initialized, "Already initialized");
        registry = registry_;
        nft = nft_;
        tokenId = tokenId_;
        oracle = oracle_;
        metadataCid = metadataCid_;
        initialized = true;
        owner = IERC721(nft_).ownerOf(tokenId_);
        emit Initialized(registry_, nft_, tokenId_, oracle_, metadataCid_);
    }

    function setOracle(address oracle_) external {
        require(msg.sender == owner || msg.sender == registry, "Not authorized");
        oracle = oracle_;
        emit OracleUpdated(oracle_);
    }

    /// @notice Push a reading for a given date key. Allows up to 2 readings per day.
    function pushReading(uint32 dateKey, int32 temperatureC, uint32 moisture) external onlyOracle {
        uint8 count = dayCount[dateKey];
        require(count < 2, "Day full");
        Reading memory r = Reading({timestamp: uint64(block.timestamp), temperatureC: temperatureC, moisture: moisture});
        dayReadings[dateKey][count] = r;
        dayCount[dateKey] = count + 1;
        emit ReadingStored(dateKey, count, r);
    }

    function getReading(uint32 dateKey, uint8 index) external view returns (Reading memory) {
        require(index < dayCount[dateKey], "Index OOB");
        return dayReadings[dateKey][index];
    }

    function getAllReadings(uint32 dateKey) external view returns (Reading[2] memory readings, uint8 count) {
        return (dayReadings[dateKey], dayCount[dateKey]);
    }
}
