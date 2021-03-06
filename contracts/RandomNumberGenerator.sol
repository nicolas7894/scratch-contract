//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "./Scratcher.sol";
import "hardhat/console.sol";



contract RandomNumberGenerator is VRFConsumerBase {

    address private requester;
    bytes32 keyHash;
    uint256 fee;
    bytes32 public lastRequestId;
    
    constructor(address _vrfCoordinator, address _link, bytes32 _keyHash, uint256 _fee)
        VRFConsumerBase(_vrfCoordinator, _link) {
            keyHash = _keyHash;
            fee = _fee;
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomness) internal override {
        Scratcher(requester).gameResult(_requestId, _randomness);
    }

    function directRequest(bytes32 requestId) public {
            requester = msg.sender; 
            uint256 random = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 100;
            Scratcher(requester).gameResult(requestId, random);
    }
    
    function request() public returns(bytes32 requestId) {
        requester = msg.sender; 
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract");
        lastRequestId = requestRandomness(keyHash, fee);
        return lastRequestId;
    }
}