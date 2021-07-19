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
var serverAddress = deployment.server_address

var smartSubscAbi = require('./build/contracts/SmartSubsc.json').abi
var smartSubscContract = new web3.eth.Contract(smartSubscAbi, contractAddress, {
    gas: deployment.gas,
    gasPrice: deployment.gasPrice
})

console.log('The server is supported to execute the following functions:')
console.log('1. setPrice')
console.log('2. consumeSubscription')
console.log('Type something else to exit.')
readline.question('What is the number corresponding to the function to be executed?\n', number => {
    switch (number) {
        case '1':
            excuteSetPrice()
            break
        case '2':
            excuteConsumeSubscription()
            break
        default:
            console.log('The server will exit...')
            process.exit()
    }
})

function excuteSetPrice() {
    readline.question('What is the price to be set in ETH?\n', _price => {
        smartSubscContract.methods.setPrice(web3.utils.toWei(_price, "ether")).send({
            from: serverAddress
        }).then(function (receipt) {
            console.log(receipt)
        })
        readline.close()
    })
}

function excuteConsumeSubscription() {
    let _owner = '', _tokenId = -1
    readline.question('What is the address of the owner?\n', owner => {
        _owner = owner
        readline.question('What is the ID of the token?\n', tokenId => {
            _tokenId = Number(tokenId)
            smartSubscContract.methods.consumeSubscription(_owner, _tokenId).send({
                from: serverAddress,
                gas: 1000000
            }).then(function (receipt) {
                console.log(receipt)
            })
            readline.close()
        })
    })
}