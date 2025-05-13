# block-hash-prover-template

this repo should be a starting point for development of BHP's for the broadcaster.

each rollup stack will have a pair of BHP's and a typescript module for interacting with them / verifying instances.

It will include:

- a skeleton pair of BHP's
- a production BHPPointer implementation
- some MPT contracts library
- a skeleton typescript module
  - the typescript module will be exported for use in things like OIF
  - produce proofs for the BHP
  - verify BHP's and provide the immutables they were constructed with
  - verify BHPPointer and ensure constructor doesn't have a storage backdoor
- a basic test harness for BHP's and their typescript module (i believe this can be built in a chain agnostic way, just given a parent/child rpc)

It will NOT include:

- code to interact with the `Receiver`
