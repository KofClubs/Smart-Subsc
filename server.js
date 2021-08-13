const Yamljs = require('yamljs')
const deployment = Yamljs.load('./deployment.yaml')
const serverAddress = deployment.server_address

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

console.log('The server is supported to execute the following functions:')
console.log('1. activateSubscription')
console.log('2. expireSubscription')
console.log('Type something else to exit.')
readline.question('What is the number corresponding to the function to be executed?\n', number => {
    switch (number) {
        case '1':
            excuteActivateSubscription()
            break
        case '2':
            excuteExpireSubscription()
            break
        default:
            console.log('The server will exit...')
            process.exit()
    }
})

function excuteActivateSubscription() {
    let _tokenId
    readline.question('What is the address of the owner?\n', _owner => {
        readline.question('What is the ID of the token?\n', tokenId => {
            _tokenId = Number(tokenId)
            smartSubscContract.methods.activateSubscription(_owner, _tokenId).send({
                from: serverAddress
            }).then(receipt => {
                console.log(receipt)
            })
            readline.close()
        })
    })
}

function excuteExpireSubscription() {
    let _tokenId
    readline.question('What is the ID of the token?\n', tokenId => {
        _tokenId = Number(tokenId)
        smartSubscContract.methods.expireSubscription(_tokenId).send({
            from: serverAddress
        }).then(receipt => {
            console.log(receipt)
        })
        readline.close()
    })
}