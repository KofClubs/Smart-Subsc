// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SmartSubsc is ERC721 {
    string private constant _name = "SmartSubsc";
    string private constant _symbol = "SS";
    address private server;
    uint256 private price;
    uint256 private serviceFeeRate;
    uint256 private tokenIdMax;
    mapping(address => uint256) private deposits;

    constructor(uint256 _price, uint256 _serviceFeeRate)
        payable
        ERC721(_name, _symbol)
    {
        server = msg.sender;
        price = _price;
        serviceFeeRate = _serviceFeeRate;
    }

    event PriceUpdated(uint256 _price);
    event ServiceFeeRateUpdated(uint256 _serviceFeeRate);
    event SubscriptionActivated(address _owner, uint256 _tokenId);
    event SubscriptionExpired(uint256 _tokenId);
    event SubscriptionPurchased(address _to, uint256 _tokenId);
    event SubscriptioCanceled(uint256 _tokenId);
    event WithdrawalSucceeded(uint256 _actualValue);

    modifier subscriptionNotActivated(address _owner, uint256 _tokenId) {
        require(_owner == ownerOf(_tokenId));
        require(getApproved(_tokenId) == server);
        _;
    }

    modifier subscriptionNotExpired(uint256 _tokenId) {
        require(ownerOf(_tokenId) == server);
        _;
    }

    function getServer() public view returns (address) {
        return server;
    }

    function getPrice() public view returns (uint256) {
        return price;
    }

    function getServiceFeeRate() public view returns (uint256) {
        return serviceFeeRate;
    }

    function getDeposit() public view returns (uint256) {
        return deposits[msg.sender];
    }

    function updatePrice(uint256 _price) public {
        require(msg.sender == server);
        price = _price;
        emit PriceUpdated(price);
    }

    function updateServiceFeeRate(uint256 _serviceFeeRate) public {
        require(msg.sender == server);
        serviceFeeRate = _serviceFeeRate;
        emit ServiceFeeRateUpdated(serviceFeeRate);
    }

    function activateSubscription(address _owner, uint256 _tokenId)
        public
        subscriptionNotActivated(_owner, _tokenId)
    {
        require(msg.sender == server);
        safeTransferFrom(_owner, server, _tokenId);
        emit SubscriptionActivated(_owner, _tokenId);
    }

    function expireSubscription(uint256 _tokenId)
        public
        subscriptionNotExpired(_tokenId)
    {
        require(msg.sender == server);
        _burn(_tokenId);
        emit SubscriptionExpired(_tokenId);
    }

    function purchaseSubscription() public payable {
        uint256 newDeposit = deposits[msg.sender] + msg.value - price;
        require(newDeposit >= 0);
        deposits[msg.sender] = newDeposit;
        _safeMint(msg.sender, tokenIdMax);
        approve(server, tokenIdMax);
        emit SubscriptionPurchased(msg.sender, tokenIdMax++);
    }

    function cancelSubscription(uint256 _tokenId)
        public
        subscriptionNotActivated(msg.sender, _tokenId)
    {
        deposits[msg.sender] += price;
        _burn(_tokenId);
        emit SubscriptioCanceled(_tokenId);
    }

    function withdraw(uint256 _value) public {
        require(_value > 0);
        require(_value <= deposits[msg.sender]);
        deposits[msg.sender] -= _value;
        uint256 actualValue = (_value / 100) * serviceFeeRate;
        payable(msg.sender).transfer(actualValue);
        emit WithdrawalSucceeded(actualValue);
    }
}
