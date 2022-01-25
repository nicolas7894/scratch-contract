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
const randomNumberGeneratorAddress =  "0xe0Dd370de7AE2928108C399C96277C368B02FC2d";
const scratchTokenAddress = "0x445e3A2D4610b0729af33638d571F79066D056Fc"
const manipArray = "0xE93eE93db7F419e87c765185AbAE2e8D5E08290C";
const linkTokenAddress = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
async function main() {
    const Scratcher = await ethers.getContractFactory("Scratcher", { libraries: { ManipArray: manipArray }});
    const scratcher = await Scratcher.attach(scratchTokenAddress);
    const LinkToken = await ethers.getContractFactory("LinkToken");
    const linkToken = await LinkToken.attach(linkTokenAddress);

    const RandomNumberGenerator = await ethers.getContractFactory("RandomNumberGenerator");
    const randomNumberGenerator = await RandomNumberGenerator.attach(randomNumberGeneratorAddress);
   // await linkToken.approve(scratchTokenAddress, toWei(10));
   // await scratcher.addLiquidity(0, { value: toWei(1)});
   // const tx = await scratcher.playGame([10]);

    console.log("reserve : ", fromWei(await scratcher.getTotalPrize() ))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
