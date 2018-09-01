var axios = require('axios');
var moment = require('moment');
var helper = require('./helper.js');

var SYNCED = false;
var ACCOUNTS = [];
const WALLET_ROOT = helper.WALLET_ROOT;
const LOGFILE = moment().format('MMDDHHmm');
var write_file = helper.writeStream(`${LOGFILE}.txt`);

test_block = { 
	hash: '18ED02D8BE1917D65E81CB27B5289E5957C93D4C448357FF598FAB0468684A36',
	number: 263102
}

// check if ledgers are synced or not
target_sync = {method: 'jt_syncing', params: []};
console.log(`request method: ${target_sync.method}`);
helper.swtNodeRequest(helper.rpcSwtNodeParam({method: target_sync.method, params: target_sync.params})).then( response => { SYNCED = true; console.log(`... ${target_sync.method} works`);	}).catch( error => { console.warn(`!!! ${target_sync.method} error`)})

// make sure we have 100 wallets for test
try {
	wallets = JSON.parse(helper.readFile('wallets.txt'));
	while ( wallets.length < 100 ) { wallets.push(helper.newWallet()); }
	helper.writeFile('wallets.txt',JSON.stringify(wallets));
} catch (e) {
	wallets = []
	while ( wallets.length < 100 ) { wallets.push(helper.newWallet()); }
	helper.writeFile('wallets.txt',JSON.stringify(wallets));
}

target_accounts = {method: 'jt_accounts', params: []};
console.log(`request method: ${target_accounts.method}`);
helper.swtNodeRequest(helper.rpcSwtNodeParam({method: target_accounts.method, params: target_accounts.params}))
		.then(
			response => {
				console.log(`... ${target_accounts.method} works`);
				ACCOUNTS = response.data.result;
				for ( let account of ACCOUNTS ) {
					targets.push({ method: 'jt_getBalance', params: [ account, 'validated' ]});
				}
				tryMethods(targets);
				if ( ACCOUNTS.indexOf(WALLET_ROOT.address) !== -1 && SYNCED ) {
					console.log("\t... good root wallet is there, let's do performance test");
					ACCOUNTS.splice(ACCOUNTS.indexOf(WALLET_ROOT.address),1);
					targets2 = []
					params_transaction = [{from: WALLET_ROOT.address, to: ACCOUNTS[0], value: "30"}];
					targets2.push({ method:'jt_signTransaction', params: params_transaction});
					targets2.push({ method: 'jt_sendTransaction', params: params_transaction });
					tryMethods(targets2);
				} else {
					console.warn("\t!!! make sure synced and add root wallet to your service node account to do performance test");
					console.log(WALLET_ROOT);
				}
			}
		)
		.catch( error => { console.warn(`!!! ${target_accounts.method} error`)})

//setTimeout( () => helper.readStream(`${LOGFILE}.txt`), 2000)
























































//ws.end()
targets =  [
	{ log: false, method: 'jt_blockNumber', params: []},
	{ log: true, method: 'jt_getBalance', params: [WALLET_ROOT.address, 'validated']},
	{ log: false, method: 'jt_getBlockByHash', params: [ test_block.hash, true]},
	{ log: false, method: 'jt_getBlockByNumber', params: [ `${test_block.number}`, true]},
	{ log: true, method: 'jt_getTransactionCount', params: [WALLET_ROOT.address, 'validated']},
	{ log: true, method: 'jt_getBlockTransactionCountByHash', params: [test_block.hash]},
	{ log: true, method: 'jt_getBlockTransactionCountByNumber', params: [`${test_block.number}`]},
	//{ log: true, method: 'jt_accounts', params: []},
	//jt_getTransactionByHash
	//jt_getTransactionByBlockHashAndIndex
	//jt_getTransactionByBlockNumberAndIndex
	{ log: true, method: 'jt_getTransactionReceipt', params: ['CC903C5B2E96D93C950B07EAB9F45E041400FDB86070D7BBF799A7CB0AC0F0E7'] },
	{ log: true, method:'jt_sign', params: ['jEwQbrKbSVgVkptbdv5vPmJKDFqmS2ehfW','0xdeadbeaf']},
];

function tryMethods(targets) {
	for ( let target of targets ) {
		console.log(`\t...request method: ${target.method}`)
		tryMethod(target)
	}
}

function tryMethod(target) {
	helper.swtNodeRequest(helper.rpcSwtNodeParam({method: target.method, params: target.params}))
		.then(
				response => { 
					console.log(`\t... ${target.method} works`);
					if ( target.log ) {console.log(response.data.result)} 
					write_file.write(helper.castString(response.data.result))
				}
		)
		.catch( error => { console.warn(`\t!!! ${target.method} error`)})
}

function sendSwt(from, to, quantity) {
	return
}
