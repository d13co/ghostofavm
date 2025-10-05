import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { GhostofavmSDK } from '../smart_contracts/artifacts/ghostofavm/GhostofavmSDK';

(async() => {
  const algorand = AlgorandClient.mainNet()
  const ghostSDK = new GhostofavmSDK({ algorand })

  const { lastRound } = await algorand.client.algod.status().do()

  const delta=2n, firstRound = lastRound - delta, validity = { firstValidRound: lastRound + 1n, lastValidRound: lastRound + 1n }

  console.log(
    await ghostSDK.blkTimestamp(
      { firstRound: lastRound - delta, lastRound: lastRound - 1n },
      validity,
    ),
  )

  console.log(
    await ghostSDK.blkProposer(
      { firstRound: lastRound - delta, lastRound: lastRound - 1n },
      validity,
    ),
  )

  console.log(
    await ghostSDK.blkData(
      { firstRound: lastRound - delta, lastRound: lastRound - 1n },
      validity,
    ),
  )
})()
