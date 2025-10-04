import { Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import pMap from 'p-map'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { GhostofavmSDK } from '../artifacts/ghostofavm/GhostofavmSDK'

describe('Ghostofavm contract', () => {
  const localnet = algorandFixture()
  beforeAll(() => {
    Config.configure({
      // debug: true,
      // traceAll: true,
      populateAppCallResources: false,
    })
    registerDebugEventHandlers()
  })
  beforeEach(localnet.newScope)

  test('blkTimestamp', async () => {
    const { algorand } = localnet

    const { lastRound } = await localnet.algorand.client.algod.status().do()
    const firstRound = lastRound - 1000n >= 1n ? lastRound - 1000n : 1n

    const sdk = new GhostofavmSDK({ algorand })
    console.time(`Simulate blkTimestamp`)
    const firstValidRound = lastRound + 1n
    const lastValidRound = lastRound + 1n
    const values = await sdk.blkTimestamp({ firstRound, lastRound }, { firstValidRound, lastValidRound })
    const rounds = new Array(Number(lastRound - firstRound + 1n)).fill(1).map((_, i) => Number(firstRound) + i)
    const results = zip(rounds, values)

    console.timeEnd(`Simulate blkTimestamp`)

    const timeLabel = 'fetch ' + rounds.length
    console.time(timeLabel)
    await pMap(
      Object.entries(results),
      async ([round, tsActual]) => {
        {
          const {
            block: {
              header: { timestamp: tsExpected },
            },
          } = await localnet.algorand.client.algod.block(BigInt(round)).headerOnly(true).do()
          expect(tsActual).toBe(tsExpected)
        }
      },
      { concurrency: 100 },
    )
    console.timeEnd(timeLabel)
  })

  test('blkProposer', async () => {
    const { algorand } = localnet

    const { lastRound } = await localnet.algorand.client.algod.status().do()
    const firstRound = lastRound - 1000n >= 1n ? lastRound - 1000n : 1n

    const sdk = new GhostofavmSDK({ algorand })
    console.time(`Simulate blkProposer`)
    const firstValidRound = lastRound + 1n
    const lastValidRound = lastRound + 1n
    const values = await sdk.blkProposer({ firstRound, lastRound }, { firstValidRound, lastValidRound })
    const rounds = new Array(Number(lastRound - firstRound + 1n)).fill(1).map((_, i) => Number(firstRound) + i)
    const results = zip(rounds, values)

    console.timeEnd(`Simulate blkProposer`)

    const timeLabel = 'fetch ' + rounds.length
    console.time(timeLabel)
    await pMap(
      Object.entries(results),
      async ([round, proposerActual]) => {
        {
          const {
            block: {
              header: { proposer: proposerExpected },
            },
          } = await localnet.algorand.client.algod.block(BigInt(round)).headerOnly(true).do()
          expect(proposerActual).toBe(proposerExpected.toString())
        }
      },
      { concurrency: 100 },
    )
    console.timeEnd(timeLabel)
  })

  test('blkData', async () => {
    const { algorand } = localnet

    const { lastRound } = await localnet.algorand.client.algod.status().do()
    const firstRound = lastRound - 1000n >= 1n ? lastRound - 1000n : 1n

    const sdk = new GhostofavmSDK({ algorand })
    console.time(`Simulate blkData`)
    const firstValidRound = lastRound + 1n
    const lastValidRound = lastRound + 1n

    const values = await sdk.blkData({ firstRound, lastRound }, { firstValidRound, lastValidRound })

    console.timeEnd(`Simulate blkData`)

    const timeLabel = 'fetch ' + values.length
    console.time(timeLabel)
    await pMap(
      values,
      async ({ round, proposer: proposerActual, timestamp: timestampActual, txnCounter: txnCounterActual }) => {
        {
          const {
            block: {
              header: { proposer: proposerExpected, timestamp: timestampExpected, txnCounter: txnCounterExpected },
            },
          } = await localnet.algorand.client.algod.block(BigInt(round)).headerOnly(true).do()

          expect(proposerActual).toBe(proposerExpected.toString())
          expect(timestampActual).toBe(timestampExpected)
          expect(txnCounterActual).toBe(txnCounterExpected)
        }
      },
      { concurrency: 100 },
    )
    console.timeEnd(timeLabel)
  })
})

function zip<K extends PropertyKey, V>(keys: K[], values: V[]): Record<K, V> {
  return Object.fromEntries(keys.map((key, i) => [key, values[i]])) as Record<K, V>
}
