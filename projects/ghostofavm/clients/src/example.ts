import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { GhostofavmSDK } from './index'

const algorand = AlgorandClient.mainNet()
const sdk = new GhostofavmSDK({ algorand })

const { lastRound } = await algorand.client.algod.status().do()

const delta = 5n

console.log(
  await sdk.blkTimestamp(
    { firstRound: lastRound - delta, lastRound: lastRound - 1n },
    { firstValidRound: lastRound + 1n, lastValidRound: lastRound + 1n },
  ),
)

console.log(
  await sdk.blkProposers(
    { firstRound: lastRound - delta, lastRound: lastRound - 1n },
    { firstValidRound: lastRound + 1n, lastValidRound: lastRound + 1n },
  ),
)

console.log(
  await sdk.getBlkData(
    { firstRound: lastRound - delta, lastRound: lastRound - 1n },
    { firstValidRound: lastRound + 1n, lastValidRound: lastRound + 1n },
  ),
)
