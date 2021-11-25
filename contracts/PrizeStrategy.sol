//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import { ManipArray } from  './utils/ManipArray.sol';
import "hardhat/console.sol";

contract PrizeStrategy {
    using ManipArray for uint[];
    using ManipArray for uint;

    uint public rangeRandom;

    event Drawn(uint[] playerNumbers, uint _randomNumber);

    constructor(uint _rangeRandom) {
        require(_rangeRandom > 0, "range too low");
        rangeRandom = uint(_rangeRandom);
    }

    function isWinner(uint[] storage _participantNumbers, uint256 _randomNumber) internal returns (bool) {

        uint256 random = (_randomNumber % rangeRandom) + 1;
        emit Drawn(_participantNumbers, random);
        while (random > 0) {
            uint256 digit = random % 10;
            random = random / 10;
            bool isInArray = _participantNumbers.contain(digit);
            if(!isInArray) return false;
        }
        return true;
    }

    function lengthOfRange() internal view returns (uint){
        return rangeRandom.getNumberLengh();
    }
    
}