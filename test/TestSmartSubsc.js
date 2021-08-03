const SmartSubsc = artifacts.require('SmartSubsc')

const TruffleAssert = require('truffle-assertions')

const Web3 = require('web3')
const web3 = new Web3()

contract('SmartSubsc', accounts => {
    const expectedName = 'SmartSubsc'
    const expectedSymbol = 'SS'
    const oldPrice = web3.utils.toWei('1', 'ether'), newPrice = web3.utils.toWei('2', 'ether')
    const oldPriceStr = '1 ether', newPriceStr = '2 ether'
    const transferredValue = web3.utils.toWei('2', 'ether') /* >= oldPrice * 2 */
    const serverAddress = accounts[0], clientAddress = accounts[1]

    beforeEach('deploy testing contract', async () => {
        instance = await SmartSubsc.new(oldPrice)
    })

    describe('test constructor', async () => {
        it('name shall be "' + expectedName + '"', async () => {
            let _name = await instance.name()
            assert.equal(_name.valueOf(), expectedName, 'wrong name')
        })

        it('symbol shall be "' + expectedSymbol + '"', async () => {
            let _symbol = await instance.symbol()
            assert.equal(_symbol.valueOf(), expectedSymbol, 'wrong symbol')
        })

        it('server shall be "' + serverAddress + '"', async () => {
            let server = await instance.getServer()
            assert.equal(server, serverAddress, 'wrong server address by getServer')
        })

        it('price shall be "' + oldPriceStr + '"', async () => {
            let price = await instance.getPrice()
            assert.equal(price.valueOf().toString(), oldPrice.toString(), 'wrong price by getPrice')
        })
    })

    describe('test updatePrice', async () => {
        it('set price to "' + newPriceStr + '"', async () => {
            let updatePriceResult = await instance.updatePrice(newPrice, {
                from: serverAddress
            })
            TruffleAssert.eventEmitted(updatePriceResult, 'PriceUpdated', (ev) => {
                return ev._price.toString() === newPrice.toString()
            }, 'wrong price by PriceUpdated')
        })
    })

    describe('test purchaseSubscription and cancelSubscription, try repurchase', async () => {
        let canceledTokenId, repurchasedTokenId

        it('purchase and cancel subscription', async () => {
            let purchaseSubscriptionResult = await instance.purchaseSubscription({
                from: clientAddress,
                value: transferredValue
            })
            TruffleAssert.eventEmitted(purchaseSubscriptionResult, 'SubscriptionPurchased', (ev) => {
                canceledTokenId = ev._tokenId
                return ev._to === clientAddress
            }, 'SubscriptionPurchased not emitted')

            let cancelSubscriptionResult = await instance.cancelSubscription(canceledTokenId, {
                from: clientAddress
            })
            TruffleAssert.eventEmitted(cancelSubscriptionResult, 'SubscriptioCanceled', (ev) => {
                return ev._tokenId.toString() === canceledTokenId.toString()
            }, 'cancelSubscription failed')

            let repurchaseSubscriptionResult = await instance.purchaseSubscription({
                from: clientAddress
            })
            TruffleAssert.eventEmitted(repurchaseSubscriptionResult, 'SubscriptionPurchased', (ev) => {
                repurchasedTokenId = ev._tokenId
                return ev._to === clientAddress && repurchasedTokenId != canceledTokenId
            }, 'repurchase failed')
        })
    })

    describe('test activateSubscription and expireSubscription', async () => {
        let tokenId

        it('purchase subscription, then activate and expire it', async () => {
            let purchaseSubscriptionResult = await instance.purchaseSubscription({
                from: clientAddress,
                value: transferredValue
            })
            TruffleAssert.eventEmitted(purchaseSubscriptionResult, 'SubscriptionPurchased', (ev) => {
                tokenId = ev._tokenId
                return ev._to === clientAddress
            }, 'SubscriptionPurchased not emitted')

            let activateSubscriptionResult = await instance.activateSubscription(clientAddress, tokenId, {
                from: serverAddress
            })
            TruffleAssert.eventEmitted(activateSubscriptionResult, 'SubscriptionActivated', (ev) => {
                return ev._owner === clientAddress && ev._tokenId.toString() === tokenId.toString()
            }, 'activateSubscription failed')

            let expireSubscriptionResult = await instance.expireSubscription(tokenId, {
                from: serverAddress
            })
            TruffleAssert.eventEmitted(expireSubscriptionResult, 'SubscriptionExpired', (ev) => {
                return ev._tokenId.toString() === tokenId.toString()
            }, 'expireSubscription failed')
        })
    })
})