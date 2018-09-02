# test performance and stability of service node

## Requirements
  - service node running ready
  - nodejs v8+
  
## Process
  - it test jt_syncing and jt_accounts first
  - it looks for the root account
  - it generate 100 test wallets to send transaction to
  - it activates accounts and test wallets
  - it schedules transactions once every 60 seconds

## Tested on
  - macosx
  
## Steps
  0. generate 100 to 500 or more local accounts
  1. have root account file as local account
  2. clone the repository
  3. test
    * npm install
    * node sntest.js
      * might need to run several times
      * use ctrl + c to break if necessary

## Findings
  1. it is good to put 10-40 tps stress, so you can generate 100 - 400 local accounts plus the root account
  2. skywell.node should disable debugging
  3. the sync is slow
