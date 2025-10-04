import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { GhostofavmSDK } from './index'

const algorand = AlgorandClient.mainNet()
const sdk = new GhostofavmSDK({ algorand })

const { lastRound } = await algorand.client.algod.status().do()

const ret = await sdk.getBlkData(
  { firstRound: lastRound - 100n, lastRound: lastRound - 1n },
  { firstValidRound: lastRound + 1n, lastValidRound: lastRound + 1n, },
)

console.log(ret)
