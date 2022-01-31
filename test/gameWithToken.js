const { expect } = require("chai");
const { link } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const fromWei = (value) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );
const toWei = (value) => ethers.utils.parseEther(value.toString());

describe("Scratcher with token", function () {
  let captoken;
  let owner;
  let user;
  let vrfCoordinator;
  let randomNumberGenerator;
  let tokenAdress;
  
  before(async function () {
    keyHash ="0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4";
    fee = toWei(0.1);
    const LinkToken = await ethers.getContractFactory("LinkToken");
    const linkToken = await LinkToken.deploy();

    const VRFCoordinator = await ethers.getContractFactory(
      "VRFCoordinatorMock"
    );
    vrfCoordinator = await VRFCoordinator.deploy(linkToken.address);

    const RandomNumberGenerator = await ethers.getContractFactory(
      "RandomNumberGenerator"
    );
    randomNumberGenerator = await RandomNumberGenerator.deploy(
      vrfCoordinator.address,
      linkToken.address,
      keyHash,
      fee,
    );
    
    await linkToken.transfer(randomNumberGenerator.address, toWei(10));

    tokenAdress = "0x0000000000000000000000000000000000000000";
  });

  beforeEach(async function () {
    [owner, user, user3, user4, user5] = await ethers.getSigners();
  });

  it("It should create a new game lottery and add liquidity", async function () {
    const requiredMatching = 3;
    const listNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    const Scratcher = await ethers.getContractFactory("Scratcher");
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      tokenAdress,
      toWei(10),
      0,
      requiredMatching,
      listNumber,
      "0"
    );
    await scratcher.deployed();
    await scratcher.addLiquidity(0, { value: toWei(10) });

    await scratcher.connect(user).addLiquidity(0, { value: toWei(10) });

    expect(await scratcher.getReserve()).to.equal(toWei(20));
    const balanceOfInvestor = await scratcher.balanceOf(owner.address);
    expect(balanceOfInvestor).to.equal(toWei(10));
  });

  it("It should remove liquidity", async function () {
    const requiredMatching = 3;
    const listNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    const Scratcher = await ethers.getContractFactory("Scratcher");
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      tokenAdress,
      toWei(10),
      0,
      requiredMatching,
      listNumber,
      "0"
    );
    await scratcher.deployed();
    await scratcher.addLiquidity(0, { value: toWei(10) });

    await scratcher.connect(user).addLiquidity(0, { value: toWei(10) });

    await scratcher.removeLiquidity(toWei(10));
    const balanceOfInvestor = await scratcher.balanceOf(owner.address);
    expect(balanceOfInvestor).to.equal(toWei(0));
    expect(await scratcher.getReserve()).to.equal(toWei(10));
  });

  it("It should get total prize", async function () {
    const requiredMatching = 3;
    const listNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    const Scratcher = await ethers.getContractFactory("Scratcher");
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      tokenAdress,
      toWei(10),
      0,
      requiredMatching,
      listNumber,
      "0"    
    );
    await scratcher.deployed();
    await scratcher.addLiquidity(0, { value: toWei(10) });

    await scratcher.connect(user).addLiquidity(0, { value: toWei(10) });

    expect(await scratcher.getTotalPrize()).to.equal(toWei(20));
  });

  it("It should play game and loose", async function () {
    const requiredMatching = 3;
    const listNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    const Scratcher = await ethers.getContractFactory("Scratcher");
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      tokenAdress,
      toWei(10),
      0,
      requiredMatching,
      listNumber,
      "0"
    );
    await scratcher.deployed();
    await scratcher.addLiquidity(0, { value: toWei(10) });

    await scratcher.connect(user).addLiquidity(0, { value: toWei(10) });

    await scratcher.playGame([1,2,3], { value: toWei(10) });

    const lastRequestId = await randomNumberGenerator.lastRequestId();
    await vrfCoordinator.callBackWithRandomness(
      lastRequestId,
      "734",
      randomNumberGenerator.address
    );

    expect(await scratcher.getTotalPrize()).to.equal(toWei(30));
  });

  it("It should play game and win", async function () {
    const requiredMatching = 3;
    const listNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    const Scratcher = await ethers.getContractFactory("Scratcher");
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      tokenAdress,
      toWei(10),
      0,
      requiredMatching,
      listNumber,
      "0"
    );
    await scratcher.deployed();
    await scratcher.addLiquidity(0, { value: toWei(10) });

    await scratcher.connect(user).addLiquidity(0, { value: toWei(10) });

    const balanceBefore = fromWei(await ethers.provider.getBalance(user3.address))
    await scratcher.connect(user3).playGame([7, 2, 3], { value: toWei(10) });
    const lastRequestId = await randomNumberGenerator.lastRequestId();
    const tx = await vrfCoordinator.callBackWithRandomness(
      lastRequestId,
      "245",
      randomNumberGenerator.address
    );
    const balanceAfter = fromWei(await ethers.provider.getBalance(user3.address))

    expect(Math.round(balanceAfter - balanceBefore)).to.equal(20);
    expect(await scratcher.getTotalPrize()).to.equal(toWei(0));
    expect(await scratcher.getReserve()).to.equal(toWei(0));
  });

  it("It should play game and win (fixed prize)", async function () {
    const requiredMatching = 3;
    const listNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    const ticketPrice = toWei(10);
    const maxPrize = toWei(15);
    const Scratcher = await ethers.getContractFactory("Scratcher");
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      tokenAdress,
      ticketPrice,
      maxPrize,
      requiredMatching,
      listNumber,
      "0"
    );
    await scratcher.deployed();

    // owner add 10 liquidity
    await scratcher.addLiquidity(toWei(10),{ value: toWei(10) } );

    // user add 10 liquidity
    await scratcher.connect(user).addLiquidity(0 ,{ value: toWei(10) });

    expect(await scratcher.getTotalPrize()).to.equal(toWei(15));

    const balanceBefore = fromWei(await ethers.provider.getBalance(user4.address))

    // user4 play game and win
    await scratcher.connect(user4).playGame([7, 2, 3], { value: ticketPrice });
    
    const lastRequestId = await randomNumberGenerator.lastRequestId();
    const tx =  await vrfCoordinator.callBackWithRandomness(
      lastRequestId,
      "245",
      randomNumberGenerator.address
    );

    const balanceAfter = fromWei(await ethers.provider.getBalance(user4.address))

    expect(Math.round(balanceAfter - balanceBefore)).to.equal(15);
    expect(await scratcher.getReserve()).to.equal(toWei(5));
    expect(await scratcher.getTotalPrize()).to.equal(maxPrize);
  });

  it("It should genare error if pool size < prize", async function () {
    const requiredMatching = 3;
    const listNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    const Scratcher = await ethers.getContractFactory("Scratcher");
    const ticketPrice = toWei(5);
    const maxPrize = toWei(20);
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      tokenAdress,
      ticketPrice,
      maxPrize,
      requiredMatching,
      listNumber,
      "0"
    );
    expect(await scratcher.getTotalPrize()).to.equal(maxPrize);
    await scratcher.deployed();

    // owner add 10 liquidity
    const liquidity1 = toWei(10);
    await scratcher.addLiquidity(0, { value: liquidity1 });

    // user add 10 liquidity
    const liquidity2 = toWei(10);
    await scratcher.connect(user).addLiquidity(0, { value: liquidity2 });

    expect(await scratcher.getReserve()).to.equal(toWei(20));

    // user3 play game and win
    await scratcher.connect(user5).playGame([7, 2, 3], { value: ticketPrice });
    const lastRequestId = await randomNumberGenerator.lastRequestId();
    await vrfCoordinator.callBackWithRandomness(
      lastRequestId,
      "245",
      randomNumberGenerator.address
    );

    // owner play game and win but error
    await expect(scratcher.playGame([7, 2, 3], { value: ticketPrice })).to.be.revertedWith(
      "reseve must be bigger or equal to total prize"
    );
  });
});
