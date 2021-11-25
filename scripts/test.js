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
const randomNumberGeneratorAddress =  "0xD0930ee96de1c85d52B1590d6Db1dAb81e117641";
const scratchTokenAddress = "0xF3102C46c4877d1fb950761B7C39Fd01dd59C32b"
const manipArray = "0x4AE7Bb6D31de58899E9bdCe5E1a49848fC67f3DF";
const linkTokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
async function main() {
    const Scratcher = await ethers.getContractFactory("Scratcher", { libraries: { ManipArray: manipArray }});
    const scratcher = await Scratcher.attach(scratchTokenAddress);
    const LinkToken = await ethers.getContractFactory("LinkToken");
    const linkToken = await LinkToken.attach(linkTokenAddress);

    const RandomNumberGenerator = await ethers.getContractFactory("RandomNumberGenerator");
    const randomNumberGenerator = await RandomNumberGenerator.attach(randomNumberGeneratorAddress);
    await linkToken.approve(scratchTokenAddress, toWei(10));
     await scratcher.addLiquidity(toWei(1));
   // const tx = await scratcher.playGame([10]);

    console.log("reserve : ", fromWei(await scratcher.getReserve() ))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
