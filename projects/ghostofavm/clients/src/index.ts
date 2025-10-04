import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { getABIDecodedValue } from '@algorandfoundation/algokit-utils/types/app-arc56'
import { CommonAppCallParams, RawSimulateOptions } from '@algorandfoundation/algokit-utils/types/composer'
import { makeEmptyTransactionSigner } from 'algosdk'
import {
  GhostofavmArgs,
  GhostofavmClient,
  GhostofavmComposer,
  GhostofavmFactory,
  GhostofavmTypes,
} from './generated/GhostofavmClient'

const emptySigner = makeEmptyTransactionSigner()

export class GhostofavmSDK {
  public algorand: AlgorandClient
  public readerAccount = 'A7NMWS3NT3IUDMLVO26ULGXGIIOUQ3ND2TXSER6EBGRZNOBOUIQXHIBGDE' // non-mainnet fee sink
  public factory: GhostofavmFactory
  private client: GhostofavmClient

  constructor({ algorand, readerAccount }: { algorand: AlgorandClient; readerAccount?: string }) {
    this.algorand = algorand
    if (readerAccount) this.readerAccount = readerAccount

    this.factory = this.algorand.client.getTypedAppFactory(GhostofavmFactory, {
      defaultSender: this.readerAccount,
    })

    this.client = this.factory.getAppClientById({ appId: 0n })
  }

  async getBlkData(
    args: GhostofavmArgs['obj']['getBlkData(uint64,uint64)(uint64,uint64,uint64,address)'],
    extraMethodCallArgs?: Omit<CommonAppCallParams, 'appId' | 'sender' | 'method' | 'args' | 'onComplete'>,
    extraSimulateArgs?: RawSimulateOptions,
  ): Promise<GhostofavmTypes['methods']['getBlkData(uint64,uint64)(uint64,uint64,uint64,address)']['returns'][]> {
    const {
      transactions: [txn],
    } = await this.factory.createTransaction.create.getBlkData({
      args,
      ...extraMethodCallArgs,
    })
    const builder = this.factory.getAppClientById({ appId: 0n }).newGroup().addTransaction(txn, emptySigner)
    const selector = 'getBlkData(uint64,uint64)(uint64,uint64,uint64,address)'
    return this.execute({ builder, selector, extraSimulateArgs })
  }

  private async execute<T>({
    builder,
    selector,
    extraSimulateArgs,
  }: {
    builder: GhostofavmComposer<any>
    selector: string
    extraSimulateArgs?: RawSimulateOptions
  }): Promise<T[]> {
    const methodName = selector.slice(0, selector.indexOf('('))

    const { confirmations } = await builder.simulate({
      extraOpcodeBudget: 170_000,
      allowMoreLogging: true,
      allowEmptySignatures: true,
      allowUnnamedResources: true,
      ...extraSimulateArgs,
    })

    // collect logs from multiple, future support for arg splitting when > 2KB
    const logs = confirmations.flatMap(({ logs }, i) => {
      if (!logs) throw new Error(`logs were not returned from simulate txn ${i}. this should never happen`)
      return logs.slice(0, -1)
    })

    const specRetObj = this.client.appSpec.methods.find(({ name }) => name === methodName)?.returns
    if (!specRetObj) throw new Error('Method not found in app spec')

    const retTypeStr = specRetObj.struct ?? specRetObj.type
    const retData: T[] = []

    for (let i = 0; i < logs.length; i++) {
      retData.push(getABIDecodedValue(new Uint8Array(logs[i]), retTypeStr, this.factory.appSpec.structs) as T)
    }

    return retData
  }
}
