# Smart-Subsc

Smart-Subsc 基于非同质化代币（non-fungible token，NFT）实现了购买和订阅服务。

## 1. 部署、测试和使用

1.1. 安装 [Node.js](https://nodejs.org/zh-cn/)、[Truffle](https://www.trufflesuite.com/truffle) 和 [Ganache](https://www.trufflesuite.com/ganache)。

1.2. 克隆本仓库，安装 Node.js 模块。

```shell
$ git clone https://github.com/KofClubs/Smart-Subsc.git
$ cd Smart-Subsc/
$ npm install
```

1.3. 根据 [`truffle-config.js`](https://github.com/KofClubs/Smart-Subsc/blob/main/truffle-config.js)，新建和设置 Ganache 工作空间。

1.4. 执行下列命令，在本地先后编译、测试和部署 [`SmartSubsc` 合约](https://github.com/KofClubs/Smart-Subsc/blob/main/contracts/SmartSubsc.sol)。

```shell
truffle compile
truffle test
truffle migrate
```

1.5. 通过 [`client.js`](https://github.com/KofClubs/Smart-Subsc/blob/main/client.js) 和 [`server.js`](https://github.com/KofClubs/Smart-Subsc/blob/main/server.js) 跟合约交互，实现客户端和服务端的功能。

## 2. 服务流程

![flowchart](https://github.com/KofClubs/Smart-Subsc/blob/main/assets/flowchart.png)

## -1. TODOs

- 通过预言机获得 ETH/USDT 交易对报价，这样可以允许合约调整以以太币为单位的订阅价格，消除以太币对法币汇率波动导致的不良影响[1]。

[1] Rimba, P., A. B. Tran, I. Weber, M. Staples, A. Ponomarev and X. Xu. (2018). “Quantifying the Cost of Distrust: Comparing Blockchain and Cloud Services for Business Process Execution.” Information Systems Frontiers, 1–19.