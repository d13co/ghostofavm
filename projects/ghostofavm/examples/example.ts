import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { GhostofavmSDK } from '../smart_contracts/artifacts/ghostofavm/GhostofavmSDK'
;(async () => {
  const algorand = AlgorandClient.mainNet()
  const ghostSDK = new GhostofavmSDK({ algorand })

  const { lastRound } = await algorand.client.algod.status().do()

  const delta = process.argv[2] ? BigInt(process.argv[2]) : 2n
  // we need custom first/last rounds to access block ranges: https://dev.algorand.co/reference/algorand-teal/opcodes/#block
  // "Fail unless A falls between txn.LastValid-1002 and txn.FirstValid (exclusive)"
  const extraMethodCallArgs = { firstValidRound: lastRound + 1n, lastValidRound: lastRound + 1n }

  console.time(`blkTimestamps x ${delta} rounds`)
  const blkTimestamps = await ghostSDK.blkTimestamp({
    methodArgsOrArgsArray: { firstRound: lastRound - delta, lastRound: lastRound - 1n },
    extraMethodCallArgs,
  })
  console.timeEnd(`blkTimestamps x ${delta} rounds`)
  if (delta < 5n) console.log({ blkTimestamps })

  console.time(`blkProposers x ${delta} rounds`)
  const blkProposers = await ghostSDK.blkProposer({
    methodArgsOrArgsArray: { firstRound: lastRound - delta, lastRound: lastRound - 1n },
    extraMethodCallArgs,
  })
  console.timeEnd(`blkProposers x ${delta} rounds`)
  if (delta < 5n) console.log({ blkProposers })

  console.time(`blkData x ${delta} rounds`)
  const blkData = await ghostSDK.blkData({
    methodArgsOrArgsArray: { firstRound: lastRound - delta, lastRound: lastRound - 1n },
    extraMethodCallArgs,
  })
  console.timeEnd(`blkData x ${delta} rounds`)
  if (delta < 5n) console.log({ blkData })
})()
