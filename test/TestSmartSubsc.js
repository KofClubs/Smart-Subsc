var SmartSubsc = artifacts.require('SmartSubsc')
const truffleAssert = require('truffle-assertions')

var Web3 = require('web3')
var web3 = new Web3()

contract('SmartSubsc', function (accounts) {
    const expectedName = 'SmartSubsc'
    const expectedSymbol = 'SS'
    const expectedPrice = web3.utils.toWei('1', 'ether')

    const serverAddress = accounts[0]
    const clientAddress = accounts[1]

    beforeEach('deploy the contract for test', async () => {
        instance = await SmartSubsc.new()
    })

    describe('test constructor', async () => {
        it('its name shall be "' + expectedName + '"', async () => {
            let _name = await instance.name()
            assert.equal(_name.valueOf(), expectedName, 'wrong name')
        })

        it('its symbol shall be "' + expectedSymbol + '"', async () => {
            let _symbol = await instance.symbol()
            assert.equal(_symbol.valueOf(), expectedSymbol, 'wrong symbol')
        })
    })

    describe('test other functions', async () => {
        it('set and get price, purchase and consume subscription', async () => {
            let setPriceResult = await instance.setPrice(expectedPrice, {
                from: serverAddress
            })
            truffleAssert.eventEmitted(setPriceResult, 'PriceSet', (ev) => {
                return ev._price.toString() === expectedPrice.toString()
            }, 'wrong price by PriceSet')

            let price = await instance.getPrice()
            assert.equal(price.valueOf().toString(), expectedPrice.toString(), 'wrong price by getPrice')

            let tokenId = -1
            let purchaseSubscriptionResult = await instance.purchaseSubscription({
                from: clientAddress,
                value: web3.utils.toWei("2", "ether")
            })
            truffleAssert.eventEmitted(purchaseSubscriptionResult, 'SubscriptionPurchased', (ev) => {
                tokenId = ev._tokenId
                return ev._by === clientAddress
            }, 'purchase failed')

            let consumeSubscriptionResult = await instance.consumeSubscription(clientAddress, tokenId, {
                from: serverAddress
            })
            truffleAssert.eventEmitted(consumeSubscriptionResult, 'SubscriptionConsumed', (ev) => {
                return ev._tokenId.toString() === tokenId.toString()
            }, 'consume failed')
        })
    })
})