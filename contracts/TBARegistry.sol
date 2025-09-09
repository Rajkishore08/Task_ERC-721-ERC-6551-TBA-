// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {TokenBoundAccount} from "./TokenBoundAccount.sol";

contract TBARegistry {
    using Clones for address;

    address public immutable implementation;
    address public owner;

    event OwnerUpdated(address indexed owner);
    event TBACreated(address indexed tba, address indexed nft, uint256 indexed tokenId, address oracle, string metadataCid, bytes32 salt);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address implementation_) {
        implementation = implementation_;
        owner = msg.sender;
        emit OwnerUpdated(msg.sender);
    }

    function setOwner(address owner_) external onlyOwner { owner = owner_; emit OwnerUpdated(owner_); }

    function _salt(address nft, uint256 tokenId) internal pure returns (bytes32) {
        return keccak256(abi.encode(nft, tokenId));
    }

    function predictTBA(address nft, uint256 tokenId) public view returns (address) {
        bytes32 salt = _salt(nft, tokenId);
        return implementation.predictDeterministicAddress(salt, address(this));
    }

    function createTBA(address nft, uint256 tokenId, address oracle, string calldata metadataCid) external returns (address tba) {
        bytes32 salt = _salt(nft, tokenId);
        tba = implementation.cloneDeterministic(salt);
        TokenBoundAccount(payable(tba)).initialize(address(this), nft, tokenId, oracle, metadataCid);
        emit TBACreated(tba, nft, tokenId, oracle, metadataCid, salt);
    }
}
