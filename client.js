const Yamljs = require('yamljs')
const deployment = Yamljs.load('./deployment.yaml')
const clientAddress = deployment.client_addresses[0]

const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider(deployment.protocol + '://' + deployment.host + ':' + deployment.port))

const Readline = require('readline')
const readline = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const smartSubscAbi = require('./build/contracts/SmartSubsc.json').abi
const smartSubscContract = new web3.eth.Contract(smartSubscAbi, deployment.SmartSubsc_address, {
    gas: deployment.gas,
    gasPrice: deployment.gasPrice
})

console.log('The client is supported to execute the following functions:')
console.log('1. getServer')
console.log('2. getPrice')
console.log('3. purchaseSubscription')
console.log('4. cancelSubscription')
console.log('Type something else to exit.')
readline.question('What is the number corresponding to the function to be executed?\n', number => {
    switch (number) {
        case '1':
            excuteGetServer()
            break
        case '2':
            excuteGetPrice()
            break
        case '3':
            excutePurchaseSubscription()
            break
        case '4':
            excuteCancelSubscription()
            break
        default:
            console.log('The client will exit...')
            process.exit()
    }
})

function excuteGetServer() {
    console.log('The server address is:')
    smartSubscContract.methods.getServer().call().then(result => {
        console.log(result)
    })
    readline.close()
}

function excuteGetPrice() {
    console.log('The price is:')
    smartSubscContract.methods.getPrice().call().then(result => {
        console.log(result)
    })
    readline.close()
}

function excutePurchaseSubscription() {
    readline.question('What is the value paid for purchase in ETH?\n', value => {
        smartSubscContract.methods.purchaseSubscription().send({
            from: clientAddress,
            value: web3.utils.toWei(value, "ether")
        }).then(receipt => {
            console.log(receipt)
        })
        readline.close()
    })
}

function excuteCancelSubscription() {
    let _tokenId
    readline.question('What is the ID of the token?\n', tokenId => {
        _tokenId = Number(tokenId)
        smartSubscContract.methods.cancelSubscription(_tokenId).send({
            from: clientAddress
        }).then(receipt => {
            console.log(receipt)
        })
        readline.close()
    })
}