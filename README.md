# test performance and stability of service node

## Requirements
  - service node running ready
  - nodejs v8+
  
## Process
  - it test jt_syncing and jt_accounts first
  - it looks for the root account
  - it generate 10 test wallets
  - it activates accounts and test wallets
  - it schedules transactions once every 30 seconds

## Tested on
  - macosx
  
## Steps
  0. generate 5 to 10 or more local accounts
  1. have root account file as local account
  2. clone the repository
  3. test
    * npm install
    * node sntest.js
      * might need to run several times
      * use ctrl + c to break if necessary

## Findings
  1. it is good to put 5 tps stress, so you can generate 5 local accounts plus the root account
  2. skywell.node should disable debugging
  3. the sync is slow
