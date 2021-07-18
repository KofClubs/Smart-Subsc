// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract SmartSubsc is ERC721 {
    string private constant _name = "SmartSubsc";
    string private constant _symbol = "SS";
    address private server;
    uint256 private price;
    bool private priceSet;
    uint256 private tokenIdMax;
    mapping(address => uint256) private deposits;

    constructor() payable ERC721(_name, _symbol) {
        server = msg.sender;
        priceSet = false;
    }

    modifier subscriptionVerified(address _owner, uint256 _tokenId) {
        require(_owner == ownerOf(_tokenId));
        require(server == getApproved(_tokenId));
        _;
    }

    function setPrice(uint256 _price) public {
        require(msg.sender == server);
        price = _price;
        priceSet = true;
    }

    function consumeSubscription(address _owner, uint256 _tokenId)
        public
        subscriptionVerified(_owner, _tokenId)
    {
        require(msg.sender == server);
        _burn(_tokenId);
    }

    function getServer() public view returns (address) {
        return server;
    }

    function getPrice() public view returns (uint256) {
        require(priceSet);
        return price;
    }

    function purchaseSubscription() public payable returns (uint256) {
        require(priceSet);
        uint256 newDeposit = deposits[msg.sender] + msg.value - price;
        require(newDeposit >= 0);
        deposits[msg.sender] = newDeposit;
        _mint(msg.sender, tokenIdMax);
        approve(server, tokenIdMax);
        return tokenIdMax++;
    }
}
