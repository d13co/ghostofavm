import { contract, Contract, log, op, uint64 } from '@algorandfoundation/algorand-typescript'
import { abimethod } from '@algorandfoundation/algorand-typescript/arc4'

@contract({ avmVersion: 11 })
export class Ghostofavm extends Contract {
  @abimethod({ onCreate: 'require' })
  public blkTimestamp(firstRound: uint64, lastRound: uint64) {
    for (let round: uint64 = firstRound; round <= lastRound; round++) {
      log(op.Block.blkTimestamp(round))
    }
  }

  @abimethod({ onCreate: 'require' })
  public blkTxnCounter(firstRound: uint64, lastRound: uint64) {
    for (let round: uint64 = firstRound; round <= lastRound; round++) {
      log(op.Block.blkTxnCounter(round))
    }
  }

  @abimethod({ onCreate: 'require' })
  public blkProposer(firstRound: uint64, lastRound: uint64) {
    for (let round: uint64 = firstRound; round <= lastRound; round++) {
      log(op.Block.blkProposer(round))
    }
  }
}
