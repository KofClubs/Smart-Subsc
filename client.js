var Yamljs = require('yamljs')
var deployment = Yamljs.load('./deployment.yaml')

var Web3 = require('web3')
var web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(deployment.protocol + '://' + deployment.host + ':' + deployment.port))

var Readline = require('readline')
var readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

var contractAddress = deployment.SmartSubsc_address
var clientAddress = deployment.client_addresses[0]

var smartSubscAbi = require('./build/contracts/SmartSubsc.json').abi
var smartSubscContract = new web3.eth.Contract(smartSubscAbi, contractAddress, {
    gas: deployment.gas,
    gasPrice: deployment.gasPrice
})

console.log('The client is supported to execute the following functions:')
console.log('1. getPrice')
console.log('2. purchaseSubscription')
console.log('Type something else to exit.')
readline.question('What is the number corresponding to the function to be executed?\n', number => {
    switch (number) {
        case '1':
            excuteGetPrice()
            break
        case '2':
            excutePurchaseSubscription()
            break
        default:
            console.log('The client will exit...')
            process.exit()
    }
})

function excuteGetPrice() {
    console.log('The price is:')
    smartSubscContract.methods.getPrice().call().then(function (result) {
        console.log(result)
    })
    readline.close()
}

function excutePurchaseSubscription() {
    readline.question('What is the value paid for purchase in ETH?\n', value => {
        smartSubscContract.methods.purchaseSubscription().send({
            from: clientAddress,
            value: web3.utils.toWei(value, "ether")
        }).then(function (receipt) {
            console.log(receipt)
        })
        readline.close()
    })
}