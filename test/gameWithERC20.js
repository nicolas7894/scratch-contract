const { expect } = require("chai");
const { link } = require("ethereum-waffle");
const { ethers } = require("hardhat");
const fromWei = (value) =>
  ethers.utils.formatEther(
    typeof value === "string" ? value : value.toString()
  );
const toWei = (value) => ethers.utils.parseEther(value.toString());

describe("Scratcher", function () {
  let captoken;
  let owner;
  let user;
  let vrfCoordinator;
  let randomNumberGenerator;
  before(async function () {
    [owner, user, user3] = await ethers.getSigners();
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
      fee
    );
    
    await linkToken.transfer(randomNumberGenerator.address, toWei(10));
  });
  beforeEach(async function () {
    const Captoken = await ethers.getContractFactory("Captoken");
    captoken = await Captoken.deploy(toWei(1000));
    await captoken.deployed();
    await captoken.transfer(user.address, toWei(10));
    await captoken.transfer(user3.address, toWei(10));
  });

  it("It should create a new game lottery and add liquidity", async function () {
    const rangeRandom = 3;
    const ManipArray = await ethers.getContractFactory("ManipArray");
    const manipArray = await ManipArray.deploy();
    const Scratcher = await ethers.getContractFactory("Scratcher", { libraries: { ManipArray: manipArray.address }});
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      captoken.address,
      toWei(10),
      0,
      rangeRandom
    );
    await scratcher.deployed();
    await captoken.approve(scratcher.address, toWei(10));
    await scratcher.addLiquidity(toWei(10));

    await captoken.connect(user).approve(scratcher.address, toWei(10));
    await scratcher.connect(user).addLiquidity(toWei(10));

    expect(await scratcher.getReserve()).to.equal(toWei(20));
    const balanceOfInvestor = await scratcher.balanceOf(owner.address);
    expect(balanceOfInvestor).to.equal(toWei(10));
  });

  it("It should remove liquidity", async function () {
    const rangeRandom = 3;
    const ManipArray = await ethers.getContractFactory("ManipArray");
    const manipArray = await ManipArray.deploy();
    const Scratcher = await ethers.getContractFactory("Scratcher", { libraries: { ManipArray: manipArray.address }});
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      captoken.address,
      toWei(10),
      0,
      rangeRandom
    );
    await scratcher.deployed();
    await captoken.approve(scratcher.address, toWei(10));
    await scratcher.addLiquidity(toWei(10));

    await captoken.connect(user).approve(scratcher.address, toWei(10));
    await scratcher.connect(user).addLiquidity(toWei(10));

    await scratcher.removeLiquidity(toWei(10));
    const balanceOfInvestor = await scratcher.balanceOf(owner.address);
    expect(balanceOfInvestor).to.equal(toWei(0));
    expect(await scratcher.getReserve()).to.equal(toWei(10));
    expect(await captoken.balanceOf(owner.address)).to.equal(toWei(980));
  });

  it("It should get total prize", async function () {
    const rangeRandom = 3;
    const ManipArray = await ethers.getContractFactory("ManipArray");
    const manipArray = await ManipArray.deploy();
    const Scratcher = await ethers.getContractFactory("Scratcher", { libraries: { ManipArray: manipArray.address }});
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      captoken.address,
      toWei(10),
      0,
      rangeRandom
    );
    await scratcher.deployed();
    await captoken.approve(scratcher.address, toWei(10));
    await scratcher.addLiquidity(toWei(10));

    await captoken.connect(user).approve(scratcher.address, toWei(10));
    await scratcher.connect(user).addLiquidity(toWei(10));

    expect(await scratcher.getTotalPrize()).to.equal(toWei(20));
  });

  it("It should play game and loose", async function () {
    const rangeRandom = 2000;
    const ManipArray = await ethers.getContractFactory("ManipArray");
    const manipArray = await ManipArray.deploy();
    const Scratcher = await ethers.getContractFactory("Scratcher", { libraries: { ManipArray: manipArray.address }});
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      captoken.address,
      toWei(10),
      0,
      rangeRandom
    );
    await scratcher.deployed();
    await captoken.approve(scratcher.address, toWei(10));
    await scratcher.addLiquidity(toWei(10));

    await captoken.connect(user).approve(scratcher.address, toWei(10));
    await scratcher.connect(user).addLiquidity(toWei(10));

    await captoken.approve(scratcher.address, toWei(10));
    await scratcher.playGame([1,2,3,3]);

    const lastRequestId = await randomNumberGenerator.lastRequestId();
    await vrfCoordinator.callBackWithRandomness(
      lastRequestId,
      "7344",
      randomNumberGenerator.address
    );

    expect(await scratcher.getTotalPrize()).to.equal(toWei(30));
  });

  it("It should play game and win", async function () {
    const rangeRandom = 2000;
    const ManipArray = await ethers.getContractFactory("ManipArray");
    const manipArray = await ManipArray.deploy();
    const Scratcher = await ethers.getContractFactory("Scratcher", { libraries: { ManipArray: manipArray.address }});
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      captoken.address,
      toWei(10),
      0,
      rangeRandom
    );
    await scratcher.deployed();
    await captoken.approve(scratcher.address, toWei(10));
    await scratcher.addLiquidity(toWei(10));

    await captoken.connect(user).approve(scratcher.address, toWei(10));
    await scratcher.connect(user).addLiquidity(toWei(10));

    await captoken.approve(scratcher.address, toWei(10));
    await captoken.connect(user3).approve(scratcher.address, toWei(10));
    await scratcher.connect(user3).playGame([1, 3, 2, 4]);
    const lastRequestId = await randomNumberGenerator.lastRequestId();
    await vrfCoordinator.callBackWithRandomness(
      lastRequestId,
      "1233",
      randomNumberGenerator.address
    );

    expect(await scratcher.getTotalPrize()).to.equal(toWei(0));
    expect(await captoken.balanceOf(user3.address)).to.equal(toWei(30));
    expect(await scratcher.getReserve()).to.equal(toWei(0));
  });

  it("It should play game and win (fixed prize)", async function () {
    const rangeRandom = 2000;
    const ticketPrice = toWei(10);
    const maxPrize = toWei(15);
    const ManipArray = await ethers.getContractFactory("ManipArray");
    const manipArray = await ManipArray.deploy();
    const Scratcher = await ethers.getContractFactory("Scratcher", { libraries: { ManipArray: manipArray.address }});
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      captoken.address,
      ticketPrice,
      maxPrize,
      rangeRandom
    );
    await scratcher.deployed();

    // owner add 10 liquidity
    await captoken.approve(scratcher.address, toWei(10));
    await scratcher.addLiquidity(toWei(10));

    // user add 10 liquidity
    await captoken.connect(user).approve(scratcher.address, toWei(10));
    await scratcher.connect(user).addLiquidity(toWei(10));

    expect(await scratcher.getTotalPrize()).to.equal(toWei(15));

    // user3 play game and win
    await captoken.connect(user3).approve(scratcher.address, ticketPrice);
    await scratcher.connect(user3).playGame([1,2,3,4]);
    const lastRequestId = await randomNumberGenerator.lastRequestId();
    await vrfCoordinator.callBackWithRandomness(
      lastRequestId,
      "1233",
      randomNumberGenerator.address
    );

    expect(await captoken.balanceOf(user3.address)).to.equal(maxPrize);
    expect(await scratcher.getReserve()).to.equal(toWei(15));
    expect(await scratcher.getTotalPrize()).to.equal(maxPrize);
  });

  it("It should genare error if pool size < prize", async function () {
    const rangeRandom = 2000;
    const ManipArray = await ethers.getContractFactory("ManipArray");
    const manipArray = await ManipArray.deploy();
    const Scratcher = await ethers.getContractFactory("Scratcher", { libraries: { ManipArray: manipArray.address }});
    const ticketPrice = toWei(5);
    const maxPrize = toWei(20);
    const scratcher = await Scratcher.deploy(
      randomNumberGenerator.address,
      captoken.address,
      ticketPrice,
      maxPrize,
      rangeRandom
    );
    expect(await scratcher.getTotalPrize()).to.equal(maxPrize);
    await scratcher.deployed();

    // owner add 10 liquidity
    const liquidity1 = toWei(10);
    await captoken.approve(scratcher.address, liquidity1);
    await scratcher.addLiquidity(liquidity1);

    // user add 10 liquidity
    const liquidity2 = toWei(10);
    await captoken.connect(user).approve(scratcher.address, liquidity2);
    await scratcher.connect(user).addLiquidity(liquidity2);

    expect(await scratcher.getReserve()).to.equal(toWei(20));

    // user3 play game and win
    await captoken.connect(user3).approve(scratcher.address, ticketPrice);
    await scratcher.connect(user3).playGame([1,2,3,4]);
    const lastRequestId = await randomNumberGenerator.lastRequestId();
    await vrfCoordinator.callBackWithRandomness(
      lastRequestId,
      "1233",
      randomNumberGenerator.address
    );

    // owner play game and win but error
    await captoken.approve(scratcher.address, toWei(10));
    await expect(scratcher.playGame([1,2,3,4])).to.be.revertedWith(
      "reseve must be bigger or equal to total prize"
    );
  });
});
