//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RandomNumberGenerator.sol";
import  './PrizeStrategy.sol';

contract Scratcher is ERC20, Ownable, PrizeStrategy{

    address public tokenAddress;
    enum PoolState { Open, close, pending }
    struct PlayRequest {
        address player;
        uint[] submittedNumber;
    }
    PoolState state;
    uint256 public ticketPrice;
    uint public totalPlayer;
    uint256 public maxPrize;
    address randomNumberGenerator;
    mapping (bytes32 => PlayRequest) playRequest;


    event Winn(address player, bool winn, uint prize);
    event NewPlayer(address player, uint[] number);

    modifier canAddLiquidity() {
        require(state == PoolState.Open, "pool must be open");
        _;
    }

    modifier canPlayGame() {
        uint256 totalPrize = getTotalPrize();
        uint256 totalReserve = getReserve();
        require(totalReserve > 0, "reserve is empty");
        require(totalReserve >= totalPrize, "reseve must be bigger or equal to total prize");
        _;
    }

    modifier onlyRandomGenerator {
		require(msg.sender == randomNumberGenerator, "Must be called by a random number generator");
		_;
	}

    constructor(address _randomNumberGenerator, address _token, uint256 _ticketPrice, uint256 _maxPrize, uint _rangeRandom)
        ERC20("Scratchy", "SCR")
        PrizeStrategy(_rangeRandom)
    {
        require(_ticketPrice > 0, "Ticket price should be bigger than zero");
        tokenAddress = _token;
        ticketPrice = _ticketPrice;
        maxPrize = _maxPrize;
        state = PoolState.Open;
        randomNumberGenerator = _randomNumberGenerator;
        
    }

    function getReserve() public view returns (uint256) {
        if(tokenAddress == address(0)) {
            return address(this).balance;
        }else {
            return IERC20(tokenAddress).balanceOf(address(this));
        }
    }

    function removeLiquidity(uint256 _amount)
        public
    {
        uint256 tokenAmount = (getReserve() * _amount) / totalSupply();
        _burn(msg.sender, _amount);
        if(tokenAddress == address(0)) {
            
            payable(msg.sender).transfer(_amount);
        }else {

            IERC20(tokenAddress).transfer(msg.sender, tokenAmount);
        }
    }


    function addLiquidity(uint256 _tokenAmount)
        canAddLiquidity
        payable
        public
    {

        require(state == PoolState.Open, "pool is close");
        
        if(tokenAddress == address(0)) {

            _mint(msg.sender, msg.value);
        }else {
            require(_tokenAmount > 0, "token amount has to be bigger than zero");
            IERC20 token = IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), _tokenAmount);
            _mint(msg.sender, _tokenAmount);
        }
    }

    function playGame(uint[] memory _selectedNumber) 
        payable
        public canPlayGame 
    {
        require(_selectedNumber.length == lengthOfRange(), "number submited wrong format");
        state = PoolState.pending;
        totalPlayer += 1;
        if(tokenAddress == address(0)) {

            require(msg.value >= ticketPrice, "ticket price error");
        }else {

            IERC20 token = IERC20(tokenAddress);
            token.transferFrom(msg.sender, address(this), ticketPrice);
        }

        bytes32 requestId = RandomNumberGenerator(randomNumberGenerator).request();
        playRequest[requestId] = PlayRequest(msg.sender, _selectedNumber);
        emit NewPlayer(msg.sender, _selectedNumber);
    }

    function gameResult(bytes32 _requestId, uint256 _randomNumber) onlyRandomGenerator public {
        PlayRequest storage pr = playRequest[_requestId];
        if(isWinner(pr.submittedNumber, _randomNumber)) {
            totalPlayer = 0;
            uint256 totalPrize = getTotalPrize();
            if(maxPrize != 0) totalPrize += ticketPrice;
            if(tokenAddress == address(0)) {
                payable(pr.player).transfer(totalPrize);
            }else {
                IERC20 token = IERC20(tokenAddress);
                token.transfer(pr.player, totalPrize);
            }
            state = PoolState.Open;
            emit Winn(pr.player, true, totalPrize);
        } else {
            emit Winn(pr.player, false, 0);
            state = PoolState.Open;
        }

    }
    
    function getTotalPrize() public view returns (uint256) {
        uint256 tokenReserve = getReserve();
        if(maxPrize != 0) return maxPrize;
        return tokenReserve;
    }

}
