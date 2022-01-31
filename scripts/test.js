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
const randomNumberGeneratorAddress =  "0x3a76315CF8521119dac980F466Ef205e96afFc35";
const scratchTokenAddress = "0xf2d7ac06eb29f25348ca85f2e5f3730f52618406"
const manipArray = "0xE93eE93db7F419e87c765185AbAE2e8D5E08290C";
const linkTokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
async function main() {
    const Scratcher = await ethers.getContractFactory("Scratcher");
    const scratcher = await Scratcher.attach(scratchTokenAddress);
    const LinkToken = await ethers.getContractFactory("LinkToken");
    const linkToken = await LinkToken.attach(linkTokenAddress);

    const RandomNumberGenerator = await ethers.getContractFactory("RandomNumberGenerator");
    const randomNumberGenerator = await RandomNumberGenerator.attach(randomNumberGeneratorAddress);
   // await linkToken.approve(scratchTokenAddress, toWei(10));
   // await scratcher.addLiquidity(0, { value: toWei(1)});
   // const tx = await scratcher.playGame([10]);
   const totalPrize = await scratcher.getTotalPrize()
   const totalReserve = await scratcher.getReserve();
  console.log("totalPrize : ", totalPrize.toString())
  console.log("totalPrize : ", totalReserve.toString())
  const data = "0x4e487b710000000000000000000000000000000000000000000000000000000000000012"
  ethers.utils.defaultAbiCoder.decode(
    [ 'bytes', 'string' ],
    hexDataSlice(data, 4)
)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
