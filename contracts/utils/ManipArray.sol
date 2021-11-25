//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library ManipArray {
    

    function contain(uint[] storage arr, uint num) public view returns(bool)
    {

        for(uint i = 0; i < arr.length; i++) {
            if(arr[i] == num) {
                return true;
            }
        }
            
        return false;
    }

    function getNumberLengh(uint number) public pure returns(uint numberLengh)
    {
        while (number > 0) {
            number = number / 10;
            numberLengh += 1;
        } 
    }
}