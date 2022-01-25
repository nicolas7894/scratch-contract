//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ManipArray } from  './utils/ManipArray.sol';
import "hardhat/console.sol";

contract PrizeStrategy {
    using ManipArray for uint[];
    using ManipArray for uint;

    uint public requiredMatching;
    uint [] public listNumber;

    event Drawn(uint[] playerNumbers, uint[] _randomNumber);

    constructor(uint _requiredMatching, uint[] memory _listNumber) {
        require(_requiredMatching > 0, "matchingNumbers too low");
        requiredMatching = uint(_requiredMatching);
        listNumber = _listNumber;
    }

    function isWinner(uint[] storage _participantNumbers, uint256 _randomNumber) internal returns (bool) {

        uint256[] memory expandedRandom = new uint256[](requiredMatching);
        expandedRandom = randomGenerator(_randomNumber);
        emit Drawn(_participantNumbers, expandedRandom);
        for(uint i = 0; i < expandedRandom.length; i++) {
            bool isInArray = _participantNumbers.contain(expandedRandom[i]);
            if(!isInArray) return false;
        }
        return true;
    }

    function randomGenerator(uint256 randomValue) internal  returns (uint256[] memory expandedValues){
        expandedValues = new uint256[](requiredMatching);
        uint[] storage _listNumber = listNumber;
        for (uint256 i = 0; i < requiredMatching; i++) {
            uint random = uint256(keccak256(abi.encode(randomValue, i)));
            uint indexPick = random % (listNumber.length - i);
            expandedValues[i] = _listNumber[indexPick];
            _listNumber.removeValueAtIndex(indexPick);
        }
        return expandedValues;
    }
  
}