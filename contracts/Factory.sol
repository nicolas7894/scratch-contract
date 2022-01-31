//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./Scratcher.sol";

contract Factory {
    event GameCreated(address gameAddress);
    address private randomNumberGenerator;

    constructor(address _randomNumberGenerator) {
        randomNumberGenerator = _randomNumberGenerator;
    }

    function createGame(address _token, uint256 _ticketPrice, uint256 _maxPrize, uint _requiredMatching, uint[] memory _listNumber, string memory _mode) public returns (address) {
        Scratcher scratcher = new Scratcher(randomNumberGenerator, _token, _ticketPrice, _maxPrize, _requiredMatching, _listNumber, _mode);
        emit GameCreated(address(scratcher));
        return address(scratcher);
    }
}