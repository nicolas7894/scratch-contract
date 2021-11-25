
const hre = require("hardhat");
const toWei = (value) => ethers.utils.parseEther(value.toString());
import { ethers } from "hardhat";

async function main() {

    let provider = ethers.getDefaultProvider();

    let contractEnsName = 'registrar.firefly.eth';
    
    let topic = ethers.utils.id("nameRegistered(bytes32,address,uint256)");
    
    let filter = {
        address: contractEnsName,
        topics: [ topic ]
    }
    
    provider.on(filter, (result) => {
        console.log(result);
    });
    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });