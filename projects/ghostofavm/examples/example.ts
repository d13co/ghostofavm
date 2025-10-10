import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { GhostofavmSDK } from '../smart_contracts/artifacts/ghostofavm/GhostofavmSDK'
;(async () => {
  const algorand = AlgorandClient.mainNet()
  const ghostSDK = new GhostofavmSDK({ algorand })

  const { lastRound } = await algorand.client.algod.status().do()

  const delta = 2n,
    extraMethodCallArgs = { firstValidRound: lastRound + 1n, lastValidRound: lastRound + 1n }

  console.log(
    await ghostSDK.blkTimestamp({
      methodArgsOrArgsArray: { firstRound: lastRound - delta, lastRound: lastRound - 1n },
      extraMethodCallArgs,
    }),
  )

  console.log(
    await ghostSDK.blkProposer({
      methodArgsOrArgsArray: { firstRound: lastRound - delta, lastRound: lastRound - 1n },
      extraMethodCallArgs,
    }),
  )

  console.log(
    await ghostSDK.blkData({
      methodArgsOrArgsArray: { firstRound: lastRound - delta, lastRound: lastRound - 1n },
      extraMethodCallArgs,
    }),
  )
})()
