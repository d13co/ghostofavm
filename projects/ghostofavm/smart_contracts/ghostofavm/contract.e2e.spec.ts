import { Config } from '@algorandfoundation/algokit-utils'
import { registerDebugEventHandlers } from '@algorandfoundation/algokit-utils-debug'
import { algorandFixture } from '@algorandfoundation/algokit-utils/testing'
import { Address, decodeUint64, encodeAddress } from 'algosdk'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { APP_SPEC, GhostofavmFactory } from '../artifacts/ghostofavm/GhostofavmClient'

const approvalProgram = Buffer.from(APP_SPEC.byteCode!.approval, 'base64')
const clearStateProgram = Buffer.from(APP_SPEC.byteCode!.clear, 'base64')

const numGlobalInts = 0
const numGlobalByteSlices = 0
const numLocalInts = 0
const numLocalByteSlices = 0

describe('Ghostofavm contract', () => {
  const localnet = algorandFixture()
  beforeAll(() => {
    Config.configure({
      debug: true,
      // traceAll: true,
    })
    registerDebugEventHandlers()
  })
  beforeEach(localnet.newScope)

  const getFactory = (account: Address) => {
    const factory = localnet.algorand.client.getTypedAppFactory(GhostofavmFactory, {
      defaultSender: account,
    })
    const client = factory.getAppClientById({ appId: 0n })
    return { factory, client }
  }

  test('1blkTimestamp', async () => {
    const { testAccount } = localnet.context
    const { factory, client } = getFactory(testAccount)
    const { lastRound } = await localnet.algorand.client.algod.status().do()

    const firstRound = lastRound - 1000n >= 1n ? lastRound - 1000n : 1n

    const {
      transactions: [txn],
    } = await factory.createTransaction.create.blkTimestamp({
      args: { firstRound, lastRound },
      firstValidRound: lastRound + 1n,
      lastValidRound: lastRound + 1n,
    })

    console.time('sim1')
    const {
      confirmations: [{ logs }],
    } = await client.newGroup().addTransaction(txn).simulate({
      extraOpcodeBudget: 170_000,
      allowMoreLogging: true,
    })
    console.timeEnd('sim1')

    const ts = logsToUint64(logs ?? [])
    const rounds = new Array(Number(lastRound - firstRound + 1n)).fill(1).map((_, i) => Number(firstRound) + i)
    const results = zip(rounds, ts)

    for (const [round, timestampExpected] of Object.entries(results)) {
      const {
        block: {
          header: { timestamp: timestampActual },
        },
      } = await localnet.algorand.client.algod.block(BigInt(round)).headerOnly(true).do()
      expect(timestampActual).toBe(BigInt(timestampExpected!))
    }
  })

  test('2blkTimestamp + blkTxnCounter', async () => {
    const { testAccount } = localnet.context
    const { factory, client } = getFactory(testAccount)
    const { lastRound } = await localnet.algorand.client.algod.status().do()

    const firstRound = lastRound - 1000n >= 1n ? lastRound - 1000n : 1n

    const {
      transactions: [txnTs],
    } = await factory.createTransaction.create.blkTimestamp({
      args: { firstRound, lastRound },
      firstValidRound: lastRound + 1n,
      lastValidRound: lastRound + 1n,
    })

    const {
      transactions: [txnTc],
    } = await factory.createTransaction.create.blkTxnCounter({
      args: { firstRound, lastRound },
      firstValidRound: lastRound + 1n,
      lastValidRound: lastRound + 1n,
    })

    console.time('sim2')
    const {
      confirmations: [{ logs: logsTs }, { logs: logsTc }],
    } = await client.newGroup().addTransaction(txnTs).addTransaction(txnTc).simulate({
      extraOpcodeBudget: 170_000,
      allowMoreLogging: true,
    })
    console.timeEnd('sim2')

    const tsArr = logsToUint64(logsTs ?? [])
    const tcArr = logsToUint64(logsTc ?? [])
    const rounds = new Array(Number(lastRound - firstRound + 1n)).fill(1).map((_, i) => Number(firstRound) + i)
    const results = zip(
      rounds,
      tsArr.map((ts, i) => ({ ts, tc: tcArr[i] })),
    )

    const timeLabel = 'fetch ' + rounds.length
    console.time(timeLabel)
    for (const [round, { ts: tsExpected, tc: tcExpected }] of Object.entries(results)) {
      const {
        block: {
          header: { timestamp: tsActual, txnCounter: tcActual },
        },
      } = await localnet.algorand.client.algod.block(BigInt(round)).headerOnly(true).do()
      expect(tsActual).toBe(BigInt(tsExpected))
      expect(tcActual).toBe(BigInt(tcExpected))
    }
    console.timeEnd(timeLabel)
  })

  test('3blkTimestamp + blkTxnCounter + blkProposer', async () => {
    const { testAccount } = localnet.context
    const { factory, client } = getFactory(testAccount)
    const { lastRound } = await localnet.algorand.client.algod.status().do()

    const firstRound = lastRound - 1000n >= 1n ? lastRound - 1000n : 1n

    const {
      transactions: [txnTs],
    } = await factory.createTransaction.create.blkTimestamp({
      args: { firstRound, lastRound },
      firstValidRound: lastRound + 1n,
      lastValidRound: lastRound + 1n,
    })

    const {
      transactions: [txnTc],
    } = await factory.createTransaction.create.blkTxnCounter({
      args: { firstRound, lastRound },
      firstValidRound: lastRound + 1n,
      lastValidRound: lastRound + 1n,
    })

    const {
      transactions: [txnPrp],
    } = await factory.createTransaction.create.blkProposer({
      args: { firstRound, lastRound },
      firstValidRound: lastRound + 1n,
      lastValidRound: lastRound + 1n,
    })

    console.time('sim3')
    const {
      confirmations: [{ logs: logsTs }, { logs: logsTc }, { logs: logsPrp }],
    } = await client.newGroup().addTransaction(txnTs).addTransaction(txnTc).addTransaction(txnPrp).simulate({
      extraOpcodeBudget: 170_000,
      allowMoreLogging: true,
    })
    console.timeEnd('sim3')

    const tsArr = logsToUint64(logsTs ?? [])
    const tcArr = logsToUint64(logsTc ?? [])
    const prpArr = logsToAddress(logsPrp ?? [])
    const rounds = new Array(Number(lastRound - firstRound + 1n)).fill(1).map((_, i) => Number(firstRound) + i)
    const results = zip(
      rounds,
      tsArr.map((ts, i) => ({ ts, tc: tcArr[i], prp: prpArr[i] })),
    )

    const timeLabel = 'fetch ' + rounds.length
    console.time(timeLabel)
    for (const [round, { ts: tsExpected, tc: tcExpected, prp: prpExpected }] of Object.entries(results)) {
      const {
        block: {
          header: { timestamp: tsActual, txnCounter: tcActual, proposer: prpActual },
        },
      } = await localnet.algorand.client.algod.block(BigInt(round)).headerOnly(true).do()
      expect(tsActual).toBe(BigInt(tsExpected))
      expect(tcActual).toBe(BigInt(tcExpected))
      expect(prpActual.toString()).toBe(prpExpected)
    }
    console.timeEnd(timeLabel)
  })
})

function logsToUint64(logs: Uint8Array[]): number[] {
  return logs.map((log) => decodeUint64(log, 'safe'))
}

function logsToAddress(logs: Uint8Array[]): string[] {
  return logs.map((log) => encodeAddress(log))
}

function zip<K extends PropertyKey, V>(keys: K[], values: V[]): Record<K, V> {
  return Object.fromEntries(keys.map((key, i) => [key, values[i]])) as Record<K, V>
}
