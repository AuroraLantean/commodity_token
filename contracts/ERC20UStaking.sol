//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol"; //_mint, _burn

import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
//safeTransfer, safeTransferFrom, safeApprove, safeIncreaseAllowance, safeDecreaseAllowance

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol"; //owner(), onlyOwner, renounceOwnership, transferOwnership,

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol"; //paused, whenNotPaused, whenPaused, _pause, _unpause

import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20BurnableUpgradeable.sol"; //burn, burnFrom

//import "hardhat/console.sol";

//----------== code From PAXG token contract
// ASSET PROTECTION DATA
// address public assetProtectionRole;
// mapping(address => bool) internal frozen;
// event AddressFrozen(address indexed addr);
// event AddressUnfrozen(address indexed addr);
// event FrozenAddressWiped(address indexed addr);
//----------==

contract ERC20U is
    OwnableUpgradeable,
    PausableUpgradeable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable
{
    uint256 public version;

    function initialize(string memory name, string memory symbol)
        public
        initializer
    {
        //console.log("ERC20Token initialize msg.sender:", msg.sender);
        __Ownable_init_unchained();
        __Pausable_init_unchained();
        __ERC20Burnable_init_unchained();
        __ERC20_init_unchained(name, symbol);
        version = 1;
        //_mint(msg.sender, initialSupply);
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function mint(address addrTo, uint256 amount)
        public
        onlyOwner
        returns (bool)
    {
        _mint(addrTo, amount);
        return true;
    }
}

contract ERC20UU is
    OwnableUpgradeable,
    PausableUpgradeable,
    ERC20Upgradeable,
    ERC20BurnableUpgradeable
{
    uint256 public version;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function setVersion(uint256 _version) public onlyOwner {
        version = _version;
    }

    function mint(address addrTo, uint256 amount)
        public
        onlyOwner
        returns (bool)
    {
        _mint(addrTo, amount);
        return true;
    }
}

//------------------------------==
//------------------------------==
contract ERC20StakingU is
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using AddressUpgradeable for address;

    //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/ERC20Mock.sol

    //--------------------==
    uint256 public version;
    uint256 public rewardInterval;

    function initialize() external initializer {
        //console.log("ERC20Staking initialize msg.sender:", msg.sender);
        rewardInterval = 365 * 1 days;
        version = 1;
        __Ownable_init();
        __Pausable_init();
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
}

contract ERC20StakingUU is
    Initializable,
    OwnableUpgradeable,
    PausableUpgradeable
{
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using AddressUpgradeable for address;

    //https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/mocks/ERC20Mock.sol

    //--------------------==
    uint256 public version;
    uint256 public rewardInterval;

    struct Record {
        uint256 stakedAmount;
        uint256 stakedAt;
        uint256 unstakedAmount;
        uint256 unstakedAt;
        uint256 rewardAmount;
    }

    mapping(address => mapping(address => Record)) public records; //[tokenAddr][userAddr]

    event Stake(address indexed user, uint256 amount, uint256 stakedAt);
    event Unstake(
        address indexed user,
        uint256 amount,
        address indexed tokenAddr,
        uint256 reward,
        uint256 unstakedAt
    );
    event WithdrawUnstaked(
        address indexed user,
        uint256 amount,
        uint256 withdrawAt
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function setVersion(uint256 _version) public onlyOwner {
        version = _version;
    }

    // for users to stake tokens
    function stake(address tokenAddr, uint256 _amount) external whenNotPaused {
        IERC20Upgradeable token = IERC20Upgradeable(tokenAddr);
        //require(amount > 0, "amount not enough");
        uint256 amount = _amount;
        if (_amount == 0) {
            amount = token.balanceOf(msg.sender);
        }
        require(
            token.allowance(msg.sender, address(this)) >= amount,
            "not enough allowance"
        );

        require(
            token.balanceOf(msg.sender) >= amount,
            "sender has no enough tokens"
        );

        Record storage record = records[tokenAddr][msg.sender];
        record.stakedAmount += amount;
        record.stakedAt = block.timestamp;
        //console.log("[c] stake: sender:", msg.sender);
        emit Stake(msg.sender, amount, block.timestamp);

        token.safeTransferFrom(msg.sender, address(this), amount);
    }

    /*struct Record {
    uint256 stakedAmount;
    uint256 stakedAt;
    uint256 unstakedAmount;
    uint256 unstakedAt;
    uint256 rewardAmount;
    }*/

    //for users to unstake their staked tokens
    function unstake(address tokenAddr, uint256 _amount)
        external
        whenNotPaused
    {
        Record storage record = records[tokenAddr][msg.sender];
        uint256 amount = _amount;
        if (_amount == 0) {
            amount = record.stakedAmount;
        }
        require(record.stakedAmount > 0, "stakedAmount is zero");
        require(record.stakedAmount >= amount, "amount to too large");

        unchecked {
            record.stakedAmount -= amount;
        }
        record.unstakedAmount += amount;
        record.unstakedAt = block.timestamp;

        if (record.stakedAmount == 0) {
            record.stakedAt = 0;
        }

        emit Unstake(msg.sender, amount, tokenAddr, 0, block.timestamp);
    }

    /*struct Record {
    uint256 stakedAmount;
    uint256 stakedAt;
    uint256 unstakedAmount;
    uint256 unstakedAt;
    uint256 rewardAmount;
    }*/

    // users can withdraw their unstaked tokens from this contract to their own addresses
    function withdrawUnstaked(address tokenAddr, uint256 _amount)
        external
        whenNotPaused
    {
        Record storage record = records[tokenAddr][msg.sender];
        require(record.unstakedAmount > 0, "no unstakedAmount");

        uint256 amount = _amount;
        if (_amount == 0) {
            amount = record.unstakedAmount;
        }
        require(record.unstakedAmount >= amount, "not enough unstakedAmount");

        IERC20Upgradeable token = IERC20Upgradeable(tokenAddr);
        require(
            token.balanceOf(address(this)) >= amount,
            "not enough tokens on contract"
        );

        emit WithdrawUnstaked(msg.sender, amount, block.timestamp);

        unchecked {
            record.unstakedAmount -= amount;
        }
        record.unstakedAt = block.timestamp;
        token.transfer(msg.sender, amount);
    }

    //only for this contract owner to pause this contract
    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    //only for this contract owner to unpause this contract
    function unpause() external onlyOwner whenPaused {
        _unpause();
    }
}
