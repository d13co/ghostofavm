import { Account, contract, Contract, Global, log, op, uint64 } from '@algorandfoundation/algorand-typescript'
import { abimethod, encodeArc4 } from '@algorandfoundation/algorand-typescript/arc4'

export type BlkData = {
  round: uint64
  timestamp: uint64
  txnCounter: uint64
  proposer: Account
}

@contract({ avmVersion: 11 })
export class Ghostofavm extends Contract {
  @abimethod({ onCreate: 'require' })
  public blkTimestamp(firstRound: uint64, lastRound: uint64): uint64 {
    for (let round: uint64 = firstRound; round <= lastRound; round++) {
      log(op.Block.blkTimestamp(round))
    }
    return 0
  }

  @abimethod({ onCreate: 'require' })
  public blkTxnCounter(firstRound: uint64, lastRound: uint64): uint64 {
    for (let round: uint64 = firstRound; round <= lastRound; round++) {
      log(op.Block.blkTxnCounter(round))
    }
    return 0
  }

  @abimethod({ onCreate: 'require' })
  public blkProposer(firstRound: uint64, lastRound: uint64): Account {
    for (let round: uint64 = firstRound; round <= lastRound; round++) {
      log(op.Block.blkProposer(round))
    }
    return Global.zeroAddress
  }

  @abimethod({ onCreate: 'require' })
  public getBlkData(firstRound: uint64, lastRound: uint64): BlkData {
    for (let round: uint64 = firstRound; round <= lastRound; round++) {
      const blkData: BlkData = {
        round,
        timestamp: op.Block.blkTimestamp(round),
        proposer: op.Block.blkProposer(round),
        txnCounter: op.Block.blkTxnCounter(round),
      }
      log(encodeArc4(blkData))
    }
    return { round: 0, timestamp: 0, proposer: Global.zeroAddress, txnCounter: 0 }
  }
}
