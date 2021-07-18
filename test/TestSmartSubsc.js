var Yamljs = require('yamljs')
var deployment = Yamljs.load('./deployment.yaml')

var Web3 = require('web3')
var web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(deployment.protocol + '://' + deployment.host + ':' + deployment.port))

var contractAddress = deployment.SmartSubsc_address
var serverAddress = deployment.server_address
var clientAddresses = deployment.client_addresses

var smartSubscAbi = require('../build/contracts/SmartSubsc.json').abi
var smartSubscContract = new web3.eth.Contract(smartSubscAbi, contractAddress, {
    gas: deployment.gas,
    gasPrice: deployment.gasPrice
})

smartSubscContract.methods.setPrice(web3.utils.toWei("1", "ether")).send({
    from: serverAddress
}).then(function (receipt) {
    console.log(receipt)
})

smartSubscContract.methods.getServer().call().then(function (result) {
    console.log(result)
})

smartSubscContract.methods.getPrice().call().then(function (result) {
    console.log(result)
})

smartSubscContract.methods.purchaseSubscription().send({
    from: clientAddresses[0],
    value: web3.utils.toWei("2", "ether")
}).then(function (receipt) {
    console.log(receipt)
})

smartSubscContract.methods.consumeSubscription(clientAddresses[0], 0).send({
    from: serverAddress,
    gas: 1000000
}).then(function (receipt) {
    console.log(receipt)
})