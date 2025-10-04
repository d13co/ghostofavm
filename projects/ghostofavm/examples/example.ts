import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { GhostofavmSDK } from '../smart_contracts/artifacts/ghostofavm/GhostofavmSDK';

(async() => {
  const algorand = AlgorandClient.mainNet()
  const sdk = new GhostofavmSDK({ algorand })

  const { lastRound } = await algorand.client.algod.status().do()

  const delta = 5n
  const validity = { firstValidRound: lastRound + 1n, lastValidRound: lastRound + 1n }

  console.log(
    await sdk.blkTimestamp(
      { firstRound: lastRound - delta, lastRound: lastRound - 1n },
      validity,
    ),
  )

  console.log(
    await sdk.blkProposer(
      { firstRound: lastRound - delta, lastRound: lastRound - 1n },
      validity,
    ),
  )

  console.log(
    await sdk.blkData(
      { firstRound: lastRound - delta, lastRound: lastRound - 1n },
      validity,
    ),
  )
})()
