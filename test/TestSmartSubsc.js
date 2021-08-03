const SmartSubsc = artifacts.require('SmartSubsc')

const TruffleAssert = require('truffle-assertions')

const Web3 = require('web3')
const web3 = new Web3()

contract('SmartSubsc', accounts => {
    const expectedName = 'SmartSubsc'
    const expectedSymbol = 'SS'
    const oldPrice = web3.utils.toWei('1', 'ether'), newPrice = web3.utils.toWei('2', 'ether')
    const oldPriceStr = '1 ether', newPriceStr = '2 ether'
    const oldServiceFeeRate = 1, newServiceFeeRate = 2
    const purchaseSubscriptionValue = web3.utils.toWei('2', 'ether') /* >= oldPrice * 2 */
    const withdrawValue = web3.utils.toWei('0.5', 'ether') /* <= purchaseSubscriptionValue - oldPrice */
    const serverAddress = accounts[0], clientAddress = accounts[1]

    beforeEach('deploy testing contract', async () => {
        instance = await SmartSubsc.new(oldPrice, 1)
    })

    describe('test constructor', async () => {
        it('name shall be "' + expectedName + '"', async () => {
            let _name = await instance.name()
            assert.equal(_name, expectedName, 'wrong name')
        })

        it('symbol shall be "' + expectedSymbol + '"', async () => {
            let _symbol = await instance.symbol()
            assert.equal(_symbol, expectedSymbol, 'wrong symbol')
        })

        it('server shall be ' + serverAddress, async () => {
            let server = await instance.getServer()
            assert.equal(server, serverAddress, 'wrong server address by getServer')
        })

        it('price shall be ' + oldPriceStr, async () => {
            let price = await instance.getPrice()
            assert.equal(price.toString(), oldPrice.toString(), 'wrong price by getPrice')
        })

        it('service fee rate shall be ' + oldServiceFeeRate.toString() + '%', async () => {
            let serviceFeeRate = await instance.getServiceFeeRate()
            assert.equal(serviceFeeRate.toString(), oldServiceFeeRate.toString(), 'wrong service fee rate by getServiceFeeRate')
        })
    })

    describe('test getDeposit and withdraw', async () => {
        it('purchase subscription and withdraw deposit', async () => {
            let purchaseSubscriptionResult = await instance.purchaseSubscription({
                from: clientAddress,
                value: purchaseSubscriptionValue
            })
            TruffleAssert.eventEmitted(purchaseSubscriptionResult, 'SubscriptionPurchased', (ev) => {
                return ev._to === clientAddress
            }, 'SubscriptionPurchased not emitted')

            let deposit = await instance.getDeposit({
                from: clientAddress
            })
            assert.equal(deposit.toString(), (purchaseSubscriptionValue - oldPrice).toString())

            let withdrawResult = await instance.withdraw(withdrawValue, {
                from: clientAddress
            })
            TruffleAssert.eventEmitted(withdrawResult, 'WithdrawalSucceeded', (ev) => {
                return ev._actualValue < withdrawValue
            }, 'withdrawal failed')
        })
    })

    describe('test updatePrice', async () => {
        it('set price to ' + newPriceStr, async () => {
            let updatePriceResult = await instance.updatePrice(newPrice, {
                from: serverAddress
            })
            TruffleAssert.eventEmitted(updatePriceResult, 'PriceUpdated', (ev) => {
                return ev._price.toString() === newPrice.toString()
            }, 'wrong price by PriceUpdated')
        })
    })

    describe('test updateServiceFeeRate', async () => {
        it('set service fee rate to ' + newServiceFeeRate.toString() + '%', async () => {
            let updateServiceFeeRateResult = await instance.updateServiceFeeRate(newServiceFeeRate, {
                from: serverAddress
            })
            TruffleAssert.eventEmitted(updateServiceFeeRateResult, 'ServiceFeeRateUpdated', (ev) => {
                return ev._serviceFeeRate.toString() === newServiceFeeRate.toString()
            }, 'wrong service fee rate by ServiceFeeRateUpdated')
        })
    })

    describe('test purchaseSubscription and cancelSubscription', async () => {
        let canceledTokenId, repurchasedTokenId

        it('purchase and cancel subscription, then repurchase it', async () => {
            let purchaseSubscriptionResult = await instance.purchaseSubscription({
                from: clientAddress,
                value: purchaseSubscriptionValue
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
                value: purchaseSubscriptionValue
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