# Smart-Subsc

Smart-Subsc 基于非同质化代币（non-fungible token，NFT）实现了购买和订阅服务。

Smart-Subsc 实现了链上支付和链下支付，分别在 [on-chain-pay 分支](https://github.com/KofClubs/Smart-Subsc/tree/on-chain-pay) 和 [off-chain-pay 分支](https://github.com/KofClubs/Smart-Subsc/tree/off-chain-pay)。链上支付要求客户端支付以太币购买订阅；链下支付要求服务端确认非同质化代币的合法性（客户端能自由铸造）。

## 1. 部署、测试和使用

1.1. 安装 [Node.js](https://nodejs.org/zh-cn/)、[Truffle](https://www.trufflesuite.com/truffle) 和 [Ganache](https://www.trufflesuite.com/ganache)。

1.2. 执行下列命令，克隆本仓库，安装 Node.js 模块。

```shell
$ git clone https://github.com/KofClubs/Smart-Subsc.git
$ cd Smart-Subsc/
$ npm install
```

1.3. 根据 [truffle-config.js](https://github.com/KofClubs/Smart-Subsc/blob/on-chain-pay/truffle-config.js)，新建和设置 Ganache 工作空间。

1.4. 执行下列命令，在本地先后编译、测试 [contracts/SmartSubsc.sol](https://github.com/KofClubs/Smart-Subsc/blob/on-chain-pay/contracts/SmartSubsc.sol)。

```shell
$ truffle compile
$ truffle test
$ truffle migrate
```

1.5. 在 [migrations/2_deploy_smartsubsc.js](https://github.com/KofClubs/Smart-Subsc/blob/on-chain-pay/migrations/2_deploy_smartsubsc.js) 可选地更改初始价格 PRICE_NUMBER 和单位 PRICE_UNIT（请参考 `toWei` 的[文档](https://web3js.readthedocs.io/en/v1.2.11/web3-utils.html#towei)），以及取款服务费率 SERVICE_FEE_RATE，它的单位是%。

```javascript
    6 module.exports = function (deployer) {
--> 7     deployer.deploy(SmartSubsc, web3.utils.toWei(PRICE_NUMBER, PRICE_UNIT), SERVICE_FEE_RATE);
    8 };
```

1.6. 通过 [client.js](https://github.com/KofClubs/Smart-Subsc/blob/on-chain-pay/client.js) 和 [server.js](https://github.com/KofClubs/Smart-Subsc/blob/on-chain-pay/server.js) 跟合约交互，实现客户端和服务端的功能。

## 2. 服务流程

(TODO)
<!-- ![flowchart](https://github.com/KofClubs/Smart-Subsc/blob/on-chain-pay/assets/flowchart.png) -->

## 3. 构造合约和调用合约函数的手续费

调用 `view` 函数无需手续费，不列出。

| 合约函数 | 手续费 / gas |
| :- | -: |
| `constructor` | 3629613 |
| `updatePrice` | 28932 |
| `updateServiceFeeRate` | 28568 |
| `activateSubscription` | [28192, 56447] |
| `expireSubscription` | [22505, 30073] |
| `purchaseSubscription` | [72651, 132651] |
| `cancelSubscription` | [25632, 36327] |
| `withdraw` | [22397, 37397] |

这些手续费很有参考价值；它们跟账户余额等条件相关，不是稳定的，这些条件包括：

1. 客户端余额账户 `deposits` 是否从0被更新或归零
1. 被操作的 `tokenId` 是否是0
1. 非同质化代币转账的发起者在转账后余额是否是0，接收者在接收前余额是否是0
1. 客户端以太币余额在支付后或退款前是否是0

## -1. TODOs

- 通过预言机获得 ETH/USDT 交易对报价，这样可以允许合约调整以以太币为单位的订阅价格，消除以太币对法币汇率波动导致的不良影响[1]。

[1] Rimba, P., A. B. Tran, I. Weber, M. Staples, A. Ponomarev and X. Xu. (2018). “Quantifying the Cost of Distrust: Comparing Blockchain and Cloud Services for Business Process Execution.” Information Systems Frontiers, 1–19.