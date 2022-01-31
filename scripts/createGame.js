// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fromWei = (value) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );
const toWei = (value) => ethers.utils.parseEther(value.toString());
const factoryAddress = "0x68EF4dEa65D3bfAa4192d31F3d7AabCAE34759B9";
const zeroAddress = '0x0000000000000000000000000000000000000000';
const rangeRandom = 3;
const listNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9];
async function main() {

    const Factory = await ethers.getContractFactory("Factory");
    const factory = await Factory.attach(factoryAddress);
    const scratchAddress = await factory.callStatic.createGame(
        zeroAddress,
        toWei(10),
        0,
        rangeRandom,
        listNumber);

    console.log("scratchAddress : ", scratchAddress)
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
