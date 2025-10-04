# ghostofavm

Ghost contracts: Contracts that do not exist on chain. They are simulated (create) to return data efficiently from the AVM.

AVM context has access to a lot resources that can be fetched/filtered/combined with a single simulate:

- 128x apps, assets, accounts
  - e.g. batch account balances
  - e.g. ABI read methods
- 1000x blocks
  - timestamp
  - txn counter
  - etc

Ghost contracts usually operate on a list of inputs (otherwise a single input could just as efficiently be done with a GET request to algod.)

In order to avoid running into the 4KB bytestring size restriction of the AVM, Ghost contracts return data by logging individual elements (instead of using ABI return of type xyz[].) The ghost contract client parses each logged line to the appropriate type, with full struct support.


