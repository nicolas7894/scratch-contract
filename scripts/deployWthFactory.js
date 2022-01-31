// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const toWei = (value) => ethers.utils.parseEther(value.toString());

async function main() {
  const keyHash =
    "0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4";
  const fee = toWei(0.0001);
  const mode = "1";
  const linkTokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
  const vrfCoordinator = "0x8C7382F9D8f56b33781fE506E897a4F1e2d17255";

  const RandomNumberGenerator = await ethers.getContractFactory(
    "RandomNumberGenerator"
  );

  const randomNumberGenerator = await RandomNumberGenerator.deploy(
    vrfCoordinator,
    linkTokenAddress,
    keyHash,
    fee,
  );

  console.log("address randomNumberGenerator : ", randomNumberGenerator.address)

  await new Promise(r => setTimeout(r, 2000));

  const Factory = await ethers.getContractFactory("Factory");
  const factory = await Factory.deploy(randomNumberGenerator.address);


  console.log("factory address  ::", factory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
