//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

library ManipArray {
    

    function contain(uint[] storage arr, uint num) internal view returns(bool)
    {

        for(uint i = 0; i < arr.length; i++) {
            if(arr[i] == num) {
                return true;
            }
        }
            
        return false;
    }

    function getNumberLengh(uint number) private pure returns(uint numberLengh)
    {
        while (number > 0) {
            number = number / 10;
            numberLengh += 1;
        } 
    }

    function removeValueAtIndex(uint[] storage arr, uint index) internal returns(uint[] storage)
    {
        arr[index] = arr[arr.length - 1];
        arr.pop();
        return arr;
    }
}