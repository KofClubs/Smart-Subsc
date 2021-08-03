var SmartSubsc = artifacts.require("SmartSubsc");

var Web3 = require('web3')
var web3 = new Web3()

module.exports = function (deployer) {
    deployer.deploy(SmartSubsc, web3.utils.toWei('1', 'ether'), 1);
};