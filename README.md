# block-hash-prover-template

this repo should be a starting point for development of BHP's for the broadcaster.

It will include:
* a skeleton pair of BHP's
* a skeleton typescript module (the ts module will produce proofs for the BHP. the typescript module will be exported for use in things like OIF)
* a basic test harness for BHP's and their typescript module (i believe this can be built in a chain agnostic way, just given a parent/child rpc)
* a utility program to verify BHP's and provide the immutables they were constructed with
* some MPT contracts library

It will NOT include:
* code to interact with the `Receiver`
